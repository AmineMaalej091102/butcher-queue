import Table from 'cli-table3';
import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        process.env[key] = value;
      }
    });
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    transport: WebSocket,
  },
});

async function showStatus() {
  console.log('Fetching queue status...\n');

  try {
    // Fetch current serving number
    const { data: queueState, error: stateError } = await supabase
      .from('queue_state')
      .select('*')
      .single();

    if (stateError) throw stateError;

    // Fetch active and pending customers
    const { data: customers, error: custError } = await supabase
      .from('customers')
      .select('*')
      .in('status', ['pending', 'active'])
      .order('ticket_number', { ascending: true });

    if (custError) throw custError;

    const serving = queueState?.current_serving || 0;

    // Summary Table
    const summaryTable = new Table({
      head: ['Metric', 'Value'],
      colWidths: [20, 10],
      style: { head: ['green'] }
    });
    summaryTable.push(['Currently Serving', `#${serving}`]);
    summaryTable.push(['Pending Approval', customers.filter(c => c.status === 'pending').length]);
    summaryTable.push(['In Active Queue', customers.filter(c => c.status === 'active').length]);

    console.log('--- SUMMARY ---');
    console.log(summaryTable.toString());
    console.log('\n');

    // Queue Details Table
    const queueTable = new Table({
      head: ['Ticket #', 'Name', 'Phone', 'Status', 'Joined'],
      style: { head: ['cyan'] }
    });

    customers.forEach(c => {
      const isServing = c.ticket_number === serving;
      queueTable.push([
        isServing ? `> ${c.ticket_number} <` : (c.ticket_number || '-'),
        c.name,
        c.phone,
        c.status,
        new Date(c.created_at).toLocaleTimeString()
      ]);
    });

    console.log('--- ACTIVE QUEUE ---');
    if (customers.length === 0) {
      console.log('Queue is currently empty.');
    } else {
      console.log(queueTable.toString());
    }

  } catch (error) {
    console.error('Operation failed:', error.message);
  } finally {
    process.exit();
  }
}

showStatus();
