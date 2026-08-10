import fetch from 'node-fetch';

async function seedEyewear() {
  console.log('Seeding GLASSVAULT Eyewear data into Supabase Cloud...');
  try {
    const res = await fetch('http://localhost:3000/api/seed');
    const data = await res.json();
    console.log('Seed response:', data);
  } catch (err) {
    console.error('Seed error:', err.message);
  }
}

seedEyewear();
