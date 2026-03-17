
'use client';

import { 
  doc, 
  setDoc, 
  collection, 
  getDocs, 
  query, 
  limit, 
  serverTimestamp, 
  Firestore, 
  addDoc 
} from 'firebase/firestore';

export async function seedDatabaseIfEmpty(db: Firestore) {
  try {
    const providersSnap = await getDocs(query(collection(db, 'serviceProviders'), limit(2)));
    // If we only have the one just created, or none, proceed with seeding
    if (providersSnap.size > 1) return;

    // Seed Additional Service Providers
    const mockProviders = [
      { 
        firstName: 'Sarah', 
        lastName: 'Jenkins', 
        email: 'sarah.j@example.com', 
        phone: '555-0101', 
        city: 'Oak Park, IL', 
        experience: '5', 
        teamSize: '1', 
        expertise: ['Residential', 'Deep Clean'], 
        status: 'approved', 
        createdAt: new Date().toISOString() 
      },
      { 
        firstName: 'Michael', 
        lastName: 'Chen', 
        email: 'michael.c@example.com', 
        phone: '555-0102', 
        city: 'Chicago, IL', 
        experience: '3', 
        teamSize: '2', 
        expertise: ['Commercial'], 
        status: 'approved', 
        createdAt: new Date().toISOString() 
      },
    ];

    for (const p of mockProviders) {
      const id = p.email.replace(/[^a-zA-Z0-9]/g, '_');
      setDoc(doc(db, 'serviceProviders', id), p);
    }

    // Seed Jobs
    const jobs = [
      { clientName: 'Sarah Jenkins', type: 'Deep Clean', time: 'Tomorrow, 09:00 AM', address: '123 Highland Ave, Oak Park, IL', status: 'Confirmed', price: 120, createdAt: serverTimestamp() },
      { clientName: 'TechFlow Offices', type: 'Commercial', time: 'Fri, 06:00 PM', address: '455 North St, Chicago, IL', status: 'Pending', price: 450, createdAt: serverTimestamp() },
      { clientName: 'Michael Chen', type: 'Residential', time: 'Sat, 11:30 AM', address: '789 Lake Dr, Chicago, IL', status: 'Confirmed', price: 85, createdAt: serverTimestamp() },
    ];
    for (const j of jobs) {
      addDoc(collection(db, 'jobs'), j);
    }

    // Seed Messages
    const messages = [
      { sender: 'client', text: "Hello! Just confirming our cleaning appointment for tomorrow at 9:00 AM.", time: "10:15 AM", createdAt: serverTimestamp() },
      { sender: 'provider', text: "Yes, I'll be there! I have everything I need.", time: "10:20 AM", createdAt: serverTimestamp() },
      { sender: 'client', text: "Perfect. Also, could you focus a bit more on the guest bathroom?", time: "10:25 AM", createdAt: serverTimestamp() },
    ];
    for (const m of messages) {
      addDoc(collection(db, 'messages'), m);
    }

    // Seed Invoices
    const invoices = [
      { invoiceId: "INV-1024", date: "Jul 15, 2024", amount: "$450.00", status: "Paid", client: "TechFlow Offices", createdAt: serverTimestamp() },
      { invoiceId: "INV-1023", date: "Jul 12, 2024", amount: "$120.00", status: "Paid", client: "Sarah Jenkins", createdAt: serverTimestamp() },
      { invoiceId: "INV-1022", date: "Jul 10, 2024", amount: "$85.00", status: "Processing", client: "Michael Chen", createdAt: serverTimestamp() },
    ];
    for (const inv of invoices) {
      addDoc(collection(db, 'invoices'), inv);
    }
  } catch (e) {
    console.warn("Seeding failed or was already done:", e);
  }
}
