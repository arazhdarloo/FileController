const axios = require("axios")
const cheerio = require("cheerio")
const fs = require("fs")
const path = require("path")

let URL = "https://git.ir/api/post/get-lectures/481285/?lang=fa";

const instance = axios.create({
    timeout: 15000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9,fa;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
        'DNT': '1'
    }
});

(async () => {
    try {
        const response = await instance.get(URL)
        const HtmlContent = response.data

        const $ = cheerio.load(HtmlContent)

        let index = 1;
        $('div').each((i, element) => {
            if ($(element).attr('class') == "card course-lectures mb-1 border-0") {
                const children = $(element).children()
                children.each((i, element) => {
                    if (($(element).attr('class')).includes("card-header course-lecture-header")) {
                        const nameChildren = $(element).children()
                        nameChildren.each((i, element) => {
                            if (element.tagName == 'h2') {
                                console.log(index + "  " + $(element).text())
                                index += 1
                            }
                        })
                    } else if (($(element).attr('class')).includes("course-lecture-list collapse")) {
                        const indexChildren = $(element).children()
                        const numbers = []
                        indexChildren.each((i, element) => {
                            ($(element).children()).each((i, element) => {
                                numbers.push($(element).attr("data-index"))
                            })
                        })
                        console.log(numbers)
                    }
                })
            }
        })
    } catch (err) {
        console.log(`i got an error - ${err}`)
    }
})()