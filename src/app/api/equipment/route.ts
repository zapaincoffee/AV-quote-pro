import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

const equipmentFilePath = path.join(process.cwd(), 'src/data/equipment.json');

// Helper function to read equipment data
async function getEquipmentData() {
  const data = await fs.readFile(equipmentFilePath, 'utf-8');
  return JSON.parse(data);
}

// Helper function to write equipment data
async function setEquipmentData(data: any) {
  await fs.writeFile(equipmentFilePath, JSON.stringify(data, null, 2));
}

// GET /api/equipment - Get all equipment
export async function GET() {
  try {
    const equipment = await getEquipmentData();
    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Failed to read equipment data:', error);
    return NextResponse.json({ message: 'Error reading equipment data' }, { status: 500 });
  }
}

// POST /api/equipment - Add new equipment
export async function POST(req: NextRequest) {
  try {
    const newEquipment = await req.json();
    const equipment = await getEquipmentData();

    // Generate a simple unique ID
    const id = Date.now().toString(); // Basic ID generation for prototype

    equipment.push({ id, ...newEquipment });
    await setEquipmentData(equipment);

    return NextResponse.json({ message: 'Equipment added successfully', id }, { status: 201 });
  } catch (error) {
    console.error('Failed to add equipment:', error);
    return NextResponse.json({ message: 'Error adding equipment' }, { status: 500 });
  }
}
