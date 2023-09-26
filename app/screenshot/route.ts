import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const url = searchParams.get("url");

	console.log('screenshot', url, searchParams);

	if (!url) {
		return NextResponse.json(
			{ error: "URL parameter is required" },
			{ status: 400 }
		);
	}
	let browser;
	try {
		browser = await puppeteer.launch();
		const page = await browser.newPage();
		await page.goto(url);

		// TO GET THE SCREENSHOT IN BINARY FORMAT
		const screenshot = await page.screenshot({ type: "png" });
		// set headers for binar response
		const init = {
			headers: {
				"Content-Type": "image/png",
			},
		};

		return new Response(screenshot, init);
	} catch (error: any) {
		return NextResponse.json(
			{ error: error.message },
			{ status: 200 }
		);
	} finally {
		if (browser) {
			await browser.close();
		}
	}
}
