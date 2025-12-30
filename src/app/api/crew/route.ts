import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

const dataPath = path.join(process.cwd(), 'src/data/crew.json');

async function getData() {
  try { return JSON.parse(await fs.readFile(dataPath, 'utf-8')); } catch { return []; }
}

async function setData(data: any) {
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
}

export async function GET() {
  return NextResponse.json(await getData());
}

export async function POST(req: NextRequest) {
  const item = await req.json();
  const list = await getData();
  const newItem = { id: Date.now().toString(), ...item };
  list.push(newItem);
  await setData(list);
  return NextResponse.json(newItem);
}
