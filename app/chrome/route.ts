import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
const chrome = require("chrome-aws-lambda")

const exePath =
  process.platform === "win32"
    ? "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
    : process.platform === "linux"
    ? "/usr/bin/google-chrome"
    : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

const getOptions = async () => {
  let options
  if (process.env.NODE_ENV === "production") {
    options = {
      args: chrome.args,
      executablePath: await chrome.executablePath,
      headless: chrome.headless,
    }
  } else {
    options = {
      args: [],
      executablePath: exePath,
      headless: true,
    }
  }
  return options
}

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
	const url = searchParams.get("url");

	console.log('screenshot', url, searchParams);

	return NextResponse.json({ url });

	if (!url) {
		return NextResponse.json(
			{ error: "URL parameter is required" },
			{ status: 400 }
		);
	}
	let browser: undefined;
	return NextResponse.json({ text:"text" });
	try {
		console.log("configuring chrome...")
		const options = await getOptions()
  
		console.log("launching browser...", options)
		const browser = await puppeteer.launch(options)
  
		console.log("opening new page...")
		const page = await browser.newPage()
  
		console.log("setting request interception...")
		await page.setRequestInterception(true)
		page.on("request", (request) => {
		  const reqType = request.resourceType()
		  if (reqType === "document") {
			request.continue()
		  } else if (process.env.NODE_ENV === "development") {
			request.continue()
		  } else {
			console.log("block request type: " + request.resourceType())
			request.abort()
		  }
		})
  
		console.log("navigating to " + url + "...")
		await page.goto(url, { timeout: 0 }).then(async (response) => {
		  console.log("url loaded") //WORKS FINE
		})
  
		if (process.env.NODE_ENV === "development") {
		  await sleep(4000)
		  console.log("add delay for javascript update")
		}
  
		console.log("get page content...")
  
		const html =
		  process.env.NODE_ENV === "development"
			? await page.content()
			: await page.evaluate(() => {
				return document.querySelector("body").innerHTML
			  })
  
		console.log("parse html...", html);
		const text = await page.$eval("*", (el: any) => el.innerText)
		console.log("closing browser...")
		await browser.close()
  
		console.log("done.")
		return NextResponse.json({ text });
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
