import express from "express";
import bodyParser from "body-parser";
import { log } from "console";
import axios from "axios";
import cheerio from "cheerio";
const app = express();
const port = process.env.PORT || 4000;

async function flipkart(title,resultArray)
{
    let p_names = [], prices = [], reviews = [], desc = [], urls = [], trs = [];
    console.log("Im flippkart");
    let webs = "https://www.flipkart.com"
    let url = `https://www.flipkart.com/search?q=${title}`
    const {data} =await axios.get(url)
    const $ = cheerio.load(data);
    const review_divs = $('._1YokD2  ._3LWZlK');
    const product_divs = $("._4rR01T")
    const prices_div = $("._1_WHN1")
    const desc_div = $(".fMghEO")
    const p_url = $("._1fQZEK")
    const total_reviews = $('span._2_R_DZ span span:contains("Reviews")');
    product_divs.each((idx,x) => {
        p_names.push($(x).text());
    });
    prices_div.each((idx,x) => {
        prices.push($(x).text());
    });  
    review_divs.each((idx,x) => {

        reviews.push($(x).text());
    });
    desc_div.each((idx,x) => {
        desc.push($(x).text());
    });
    total_reviews.each((idx,x) => {
        trs.push($(x).text());
    });
    p_url.each((idx,x) => {
        urls.push(webs+$(x).attr("href"));
    });
    const extractNumbers = (str) => {
        const matches = str.match(/\d+/g); // Updated regular expression to include commas
        return matches ? parseInt(matches.join(''), 10) : null;
    };
    let trs_real= trs.map(extractNumbers);
    const tempresultArray = p_names.map((product, index) => ({
        title: product,
        url: urls[index],
        total_review_count: parseInt(trs_real[index],10),
        price: parseFloat(prices[index].replace(/[,₹]/g, '')),
        rating: parseFloat(reviews[index]),
        description: desc[index],
        website: webs
    }));
    for(let i = 0; i<tempresultArray.length; i++)
    {
        resultArray.push(tempresultArray[i]);
    }
}
async function shopclues(p_names, prices, reviews, desc, urls, trs)
{
    console.log("Im shopclues");
    let webs = "https://www.shopclues.com"
}
async function snapdeal(p_names, prices, reviews, desc, urls, trs)
{
    console.log("Im snapdeal");
    let webs = "https://www.snapdeal.com"
}
app.get("/do", async (req, res) => {
    try{
        let title = req.query.title;
        let filter = req.query.filter;
        let topN = req.query.topN;
        let website = req.query.website;
        let resultArray = [];
        console.log(title,filter,topN);
        console.log(website);
        if(typeof website === 'string') website = [website]
        if(website === undefined ) website = ['flipkart','snapdeal','shopclues']
        if(website.length == 1 && website[0]=="") website = ['flipkart','snapdeal','shopclues']
        console.log(website);
        for(let i = 0; i<website.length; i++)
        {
            if(website[i] == 'flipkart') await flipkart(title,resultArray)
            else if(website[i] == 'snapdeal') await snapdeal(title,resultArray);
            else if(website[i] == 'shopclues') await shopclues(title,resultArray)
        }
        
        const obj = {
            products: resultArray,
            total_products_considered: resultArray.length
        }
        if(filter == 'lp') obj.products.sort((a,b)=> a.price - b.price);
        else if(filter == 'hp') obj.products.sort((a,b)=> b.price - a.price);
        else if(filter == 'hreview') obj.products.sort((a,b)=> b.total_review_count - a.total_review_count);
        else if(filter == 'hrating') obj.products.sort((a,b)=> b.rating - a.rating);
        let n = parseInt(topN,10)

        obj.products.splice(n);

        const myobj = JSON.stringify(obj);
        res.send(myobj)
    }
    catch(err)
    {
        res.send(err);
    }
});

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});
