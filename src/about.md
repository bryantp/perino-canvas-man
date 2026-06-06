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

[Get in touch](/contact/) to discuss your project.
