import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

const settingsFilePath = path.join(process.cwd(), 'src/data/settings.json');

// Helper function to read settings
async function getSettingsData() {
  try {
    const data = await fs.readFile(settingsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Return defaults if file doesn't exist
    return {
      termsOfService: '',
      paymentTerms: ''
    };
  }
}

// Helper function to write settings
async function setSettingsData(data: any) {
  await fs.writeFile(settingsFilePath, JSON.stringify(data, null, 2));
}

// GET /api/settings
export async function GET() {
  try {
    const settings = await getSettingsData();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to read settings:', error);
    return NextResponse.json({ message: 'Error reading settings' }, { status: 500 });
  }
}

// POST /api/settings
export async function POST(req: NextRequest) {
  try {
    const newSettings = await req.json();
    await setSettingsData(newSettings);
    return NextResponse.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json({ message: 'Error updating settings' }, { status: 500 });
  }
}
