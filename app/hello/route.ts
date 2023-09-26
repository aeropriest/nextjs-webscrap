import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
	const url = searchParams.get("url");

	console.log('screenshot', url, searchParams);

	return NextResponse.json({ url: "hello world" });
}
