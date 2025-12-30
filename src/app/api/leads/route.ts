import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

const leadsFilePath = path.join(process.cwd(), 'src/data/leads.json');

async function getLeadsData() {
  try {
    const data = await fs.readFile(leadsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function setLeadsData(data: any) {
  await fs.writeFile(leadsFilePath, JSON.stringify(data, null, 2));
}

// GET /api/leads
export async function GET() {
  const leads = await getLeadsData();
  return NextResponse.json(leads);
}

// POST /api/leads - Add new lead
export async function POST(req: NextRequest) {
  try {
    const leadData = await req.json();
    const leads = await getLeadsData();
    const newLead = {
      id: Date.now().toString(),
      source: leadData.source || 'Manual',
      content: leadData.content,
      status: 'New', // New, Processed, Archived
      createdAt: new Date().toISOString(),
      ...leadData
    };
    leads.unshift(newLead); // Add to top
    await setLeadsData(leads);
    return NextResponse.json(newLead, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating lead' }, { status: 500 });
  }
}

// PUT /api/leads - Update lead status
export async function PUT(req: NextRequest) {
    try {
        const { id, status } = await req.json();
        const leads = await getLeadsData();
        const index = leads.findIndex((l: any) => l.id === id);
        if (index !== -1) {
            leads[index].status = status;
            await setLeadsData(leads);
            return NextResponse.json({ message: 'Lead updated' });
        }
        return NextResponse.json({ message: 'Lead not found' }, { status: 404 });
    } catch (error) {
        return NextResponse.json({ message: 'Error updating lead' }, { status: 500 });
    }
}
