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

// GET /api/equipment/[id] - Get single equipment by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const equipment = await getEquipmentData();
    const item = equipment.find((e: any) => e.id === id);

    if (item) {
      return NextResponse.json(item);
    } else {
      return NextResponse.json({ message: 'Equipment not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Failed to get equipment:', error);
    return NextResponse.json({ message: 'Error getting equipment' }, { status: 500 });
  }
}

// PUT /api/equipment/[id] - Update equipment by ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const updatedData = await req.json();
    let equipment = await getEquipmentData();

    const index = equipment.findIndex((e: any) => e.id === id);

    if (index !== -1) {
      equipment[index] = { ...equipment[index], ...updatedData, id }; // Ensure ID remains
      await setEquipmentData(equipment);
      return NextResponse.json({ message: 'Equipment updated successfully' });
    } else {
      return NextResponse.json({ message: 'Equipment not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Failed to update equipment:', error);
    return NextResponse.json({ message: 'Error updating equipment' }, { status: 500 });
  }
}

// DELETE /api/equipment/[id] - Delete equipment by ID
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    let equipment = await getEquipmentData();

    const initialLength = equipment.length;
    equipment = equipment.filter((e: any) => e.id !== id);

    if (equipment.length < initialLength) {
      await setEquipmentData(equipment);
      return NextResponse.json({ message: 'Equipment deleted successfully' });
    } else {
      return NextResponse.json({ message: 'Equipment not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Failed to delete equipment:', error);
    return NextResponse.json({ message: 'Error deleting equipment' }, { status: 500 });
  }
}
