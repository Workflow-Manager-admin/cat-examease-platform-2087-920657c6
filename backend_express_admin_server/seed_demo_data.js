//
// Script: seed_demo_data.js
// Populates Supabase with demo records for CAT ExamEase demo (users, results, schedule, halltickets, revaluations)
// Usage: node seed_demo_data.js
// Safe to run multiple times (should only insert DEMO_MARKED records)
//

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const SUPABASE_URL = process.env.SUPABASE_URL || "https://jzytsedlsvhnrfypwasm.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6eXRzZWRsc3ZobnJmeXB3YXNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjEyMjAsImV4cCI6MjA2NzQ5NzIyMH0.Y_NeTtEhMP-mhFRFORnhQ_H3spyF6GQexR-k8-AWOn0";
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Demo Mode environment key
const DEMO_MARKER_KEY = "is_demo";
const DEMO_MARKER_VAL = true;

const students = [
  { name: 'Shilpa Karedla', score: 98.5, percentile: 99.1, exam: 'Quant', exam_date: '2024-09-12', revaluation: 'Approved' },
  { name: 'Aryan Mehta', score: 82.0, percentile: 88.6, exam: 'LRDI', exam_date: '2024-09-14', revaluation: 'Rejected' },
  { name: 'Priya Nair', score: 91.4, percentile: 94.3, exam: 'VARC', exam_date: '2024-09-13', revaluation: 'Pending' },
  { name: 'Karan Verma', score: 75.2, percentile: 81.0, exam: 'Quant', exam_date: '2024-09-12', revaluation: 'Approved' },
  { name: 'Ananya Gupta', score: 88.6, percentile: 90.2, exam: 'LRDI', exam_date: '2024-09-14', revaluation: 'None' },
  { name: 'Rohit Shah', score: 67.0, percentile: 74.5, exam: 'VARC', exam_date: '2024-09-13', revaluation: 'Approved' },
  { name: 'Meera Reddy', score: 95.3, percentile: 97.6, exam: 'Quant', exam_date: '2024-09-12', revaluation: 'Rejected' },
  { name: 'Nikhil Patel', score: 58.4, percentile: 63.9, exam: 'LRDI', exam_date: '2024-09-14', revaluation: 'Pending' },
  { name: 'Aishwarya Sinha', score: 99.0, percentile: 99.7, exam: 'VARC', exam_date: '2024-09-13', revaluation: 'None' },
  { name: 'Devansh Rana', score: 85.7, percentile: 89.5, exam: 'Quant', exam_date: '2024-09-12', revaluation: 'Approved' }
];

// Sample schedule (upsert, may already exist)
const exam_schedules = [
  { exam_name: "Quant", exam_date: "2024-09-12T09:30:00", duration: 120, venue: "Delhi Exam Centre 1", [DEMO_MARKER_KEY]: DEMO_MARKER_VAL },
  { exam_name: "VARC",  exam_date: "2024-09-13T09:30:00", duration: 120, venue: "Delhi Exam Centre 2", [DEMO_MARKER_KEY]: DEMO_MARKER_VAL },
  { exam_name: "LRDI",  exam_date: "2024-09-14T14:00:00", duration: 120, venue: "Delhi Exam Centre 3", [DEMO_MARKER_KEY]: DEMO_MARKER_VAL }
];

// Helper: Generates a "demo" student email
function makeEmail(name, ix) {
  const part = name.toLowerCase().replace(/[^a-z0-9]/g,'');
  return `${part || "user"}${ix+1}@demo.cat.com`;
}
function randomCentre(exam) {
  return exam === "Quant" ? "Delhi Exam Centre 1" : exam === "VARC" ? "Delhi Exam Centre 2" : "Delhi Exam Centre 3";
}
function randomTicketNum(ix) {
  return "HT-CAT-" + String(10000 + ix * 3 + Math.floor(Math.random()*80));
}

async function main() {
  console.log("== DEMO DATA SEED START ==");

  // 1. Upsert exam schedules for demo (ignore duplicates)
  for (const sched of exam_schedules) {
    const { error } = await supabase.from("schedule").upsert([sched], { onConflict: ["exam_name", "exam_date"] });
    if (error) console.warn("Error upserting schedule", sched.exam_name, error);
  }

  // 2. For each student, create user and cross-linked rows
  for (let i = 0; i < students.length; ++i) {
    const s = students[i];
    const email = makeEmail(s.name, i);
    const password = "demostudent" + (i+1) + "CAT";
    // (a) Create user in Auth (or fetch if already seeded)
    let userId = null;
    let alreadyCreated = false;
    {
      // Check for existing Auth user
      let userResp = await supabase.auth.admin.listUsers({ email });
      let user = userResp?.users?.find(u=>u.email===email);
      if (!user) {
        let { data, error } = await supabase.auth.admin.createUser({
          email,
          password,
          user_metadata: { name: s.name, role: "candidate", [DEMO_MARKER_KEY]: DEMO_MARKER_VAL }
        });
        if (data && data.user) user = data.user;
      } else {
        alreadyCreated = true;
      }
      if (!user) {
        console.warn(`Failed to create/find user for ${s.name} (${email})`);
        continue;
      }
      userId = user.id;
      // Insert into users table
      const { error } = await supabase.from("users").upsert([
        { id: userId, email, name: s.name, role: "candidate", [DEMO_MARKER_KEY]: DEMO_MARKER_VAL }
      ]);
      if (error) console.warn("Failed to upsert users row", s.name, error);
    }

    // (b) Insert results
    await supabase.from("results").upsert([
      {
        user_id: userId,
        exam_name: s.exam,
        score: s.score,
        percentile: s.percentile,
        status: s.score >= 70 ? "pass" : "fail",
        date: s.exam_date,
        [DEMO_MARKER_KEY]: DEMO_MARKER_VAL
      }
    ], { onConflict: ["user_id", "exam_name"] });

    // (c) Insert hall tickets
    await supabase.from("halltickets").upsert([
      {
        user_id: userId,
        exam_name: s.exam,
        exam_date: s.exam_date,
        centre: randomCentre(s.exam),
        ticket_number: randomTicketNum(i),
        status: "active",
        pdf_url: `https://cdn.cat-demo.com/hallticket/student${i+1}.pdf`,
        [DEMO_MARKER_KEY]: DEMO_MARKER_VAL
      }
    ], { onConflict: ["user_id", "exam_name"] });

    // (d) Insert revaluations if needed
    if (s.revaluation && s.revaluation.toLowerCase() !== "none") {
      await supabase.from("revaluations").insert([
        {
          user_id: userId,
          exam_name: s.exam,
          reason: "Demo: Request for revaluation",
          document_url: null,
          status: s.revaluation.toLowerCase(),
          [DEMO_MARKER_KEY]: DEMO_MARKER_VAL
        }
      ]);
    }
  }
  console.log(`Inserted demo records for ${students.length} candidates.`);
  console.log(`== DEMO DATA SEED END ==\n`);
}

main();
