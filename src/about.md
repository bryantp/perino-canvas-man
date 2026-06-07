---
layout: layouts/page.njk
title: "About Us"
eleventyComputed:
  subtitle: "Custom canvas, established {{ site.founded_year }}."
permalink: "/about/"
---

{{ site.name }} is a {{ site.contact.city }}, {{ site.contact.state }} shop specializing in custom canvas work for homes, businesses, and boats. Established in {{ site.founded_year }}, we're {{ site.region }}'s leading provider of residential canvas awnings, marine canvas, and marine upholstery. Everything we make is patterned, sewn, and installed by our own team — never subcontracted. We do all the field measurements; you do not have to measure anything.

## What we make

- **Residential** — patio awnings, pool cabana covers, window awnings, BBQ and island covers, screen rooms, and custom enclosures.
- **Commercial** — storefront awnings, gym wall mats, truck covers, and protective covers for any equipment.
- **Marine** — full canvas enclosures, bimini tops, cockpit and aft covers, winter covers, camper backs, and custom upholstery.

## Materials we work with

We use only premium marine- and outdoor-grade fabrics from industry leaders.

<div style="display:flex; flex-wrap:wrap; gap:2rem; align-items:center; justify-content:center; margin:2rem 0;">
{% for s in site.suppliers -%}
  <a href="{{ s.url }}"><img src="{{ s.logo }}" alt="{{ s.name }}" style="max-height:60px; width:auto;"></a>
{% endfor -%}
</div>

## Service contracts

For residential awnings, we also provide service contracts covering seasonal removal, storage, and rehang — so your investment is protected year-round and you never have to handle the work yourself.

<h2 id="testimonials">Testimonials</h2>

<div class="testimonials">

<blockquote>
<p>I want to take this opportunity to tell you how much I appreciate how quickly you turned around the reupholstered footrests and side tables for the dialysis center patient chairs. In addition to the fact that you did them so quickly for us, they look brand new and match the chair material perfectly. Thanks again for a great job.</p>
<cite>— P. Hansen</cite>
</blockquote>

<blockquote>
<p>For 18 years you have more than fulfilled our requirements for canvas work on our boat. Your work has always been done not only on time, but correctly and to our satisfaction the first time. Rest assured, we will return to Perino's Canvas for all of our future work.</p>
<cite>— J. Holwell</cite>
</blockquote>

<blockquote>
<p>I want to THANK YOU for getting my Fountain done in the most professional manner. I just moved to the area and I am so thankful to encounter people like yourself, you are "THE BEST".</p>
<cite>— R. DeCicco</cite>
</blockquote>

<blockquote>
<p>WOW! LOOKS GREAT! I have been hearing those words a lot lately. You guys did a great job on my Sea Ray interior. Even more impressive you did it for the price quoted from the beginning and the whole time I felt like I was your only customer.</p>
<cite>— R. Francis</cite>
</blockquote>

</div>

[Get in touch](/contact/) to discuss your project.
