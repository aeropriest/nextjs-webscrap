import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import chromium from "chrome-aws-lambda";
import fs from "fs";


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
	const url = searchParams.get("url");

	console.log('screenshot', url, searchParams);
	
	const executablePath = await chromium.executablePath;

	const randomId = Math.random().toString(36).substring(2, 15);
  
	const imagePath = `/tmp/screenshot-${randomId}.jpg`;
  
	const getScreenshot = async (url: string) => {
	  console.log("Get screenshot", new Date());
	  const browser = await chromium.puppeteer.launch({
		args: [
		  ...chromium.args,
		  "--autoplay-policy=user-gesture-required",
		  "--disable-background-networking",
		  "--disable-background-timer-throttling",
		  "--disable-backgrounding-occluded-windows",
		  "--disable-breakpad",
		  "--disable-client-side-phishing-detection",
		  "--disable-component-update",
		  "--disable-default-apps",
		  "--disable-dev-shm-usage",
		  "--disable-domain-reliability",
		  "--disable-extensions",
		  "--disable-features=AudioServiceOutOfProcess",
		  "--disable-hang-monitor",
		  "--disable-ipc-flooding-protection",
		  "--disable-notifications",
		  "--disable-offer-store-unmasked-wallet-cards",
		  "--disable-popup-blocking",
		  "--disable-print-preview",
		  "--disable-prompt-on-repost",
		  "--disable-renderer-backgrounding",
		  "--disable-setuid-sandbox",
		  "--disable-speech-api",
		  "--disable-sync",
		  "--hide-scrollbars",
		  "--ignore-gpu-blacklist",
		  "--metrics-recording-only",
		  "--mute-audio",
		  "--no-default-browser-check",
		  "--no-first-run",
		  "--no-pings",
		  "--no-sandbox",
		  "--no-zygote",
		  "--password-store=basic",
		  "--use-gl=swiftshader",
		  "--use-mock-keychain",
		],
		executablePath,
		headless: true,
	  });
  
	  const page = await browser.newPage();
  
	  try {
		await page.goto(url, { waitUntil: "networkidle2" });
	  } catch (error) {
		console.log("Error", error);
	  }
  
	  await page.setViewport({ height: 1280, width: 1280 });
  
	  const screenshot = await page.screenshot({ type: "png" });
	  await browser.close();
	  return screenshot;
	};
  
	
	const screenshot = await getScreenshot(url||'https://www.google.com/');
	const init = {
		headers: {
			"Content-Type": "image/png",
		},
	};

	return new Response(screenshot, init);

  
	return NextResponse.json({ url });
  
	// res.writeHead(200, { "Content-Type": "image/jpeg" });
	// res.end(img, "binary");
}
