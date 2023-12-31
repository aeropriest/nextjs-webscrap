import { NextResponse } from "next/server";
import puppeteer from "puppeteer";


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
	const url = searchParams.get("url");

	console.log('screenshot', url, searchParams);

	// return NextResponse.json({ url });

	if (!url) {
		return NextResponse.json(
			{ error: "URL parameter is required" },
			{ status: 400 }
		);
	}
	let browser: undefined;
	try {
		// browser = await puppeteer.launch();
		const browser = await puppeteer.connect({
			browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BLESS_TOKEN}`,
		  })
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

		await browser.close();
		return new Response(screenshot, init);
	} catch (error: any) {
		return NextResponse.json(
			{ error: error.message },
			{ status: 200 }
		);
	} finally {
		if (browser) {
			// await browser.close();
		}
	}
}
