import urllib.request
import json
import re

api_url = "https://en.wikipedia.org/w/api.php?action=query&titles=File:Greater_London_UK_district_map_(blank).svg&prop=imageinfo&iiprop=url&format=json"
req = urllib.request.Request(api_url, headers={'User-Agent': 'Mozilla/5.0'})
resp = urllib.request.urlopen(req).read().decode('utf-8')
data = json.loads(resp)

pages = data['query']['pages']
page_id = list(pages.keys())[0]
image_url = pages[page_id]['imageinfo'][0]['url']

req_img = urllib.request.Request(image_url, headers={'User-Agent': 'Mozilla/5.0'})
svg_content = urllib.request.urlopen(req_img).read().decode('utf-8')

# The SVG is 1425 x 1140 and has a global transform
viewBox = "0 0 1425 1140"
transform = "matrix(1,0,0,1.6,0,-62.661196)"

# Only get the `<g id="Districts">` block
districts_match = re.search(r'<g[^>]*id="Districts"[^>]*>(.*?)</g>', svg_content, re.DOTALL)
if districts_match:
    districts_content = districts_match.group(1)
else:
    districts_content = svg_content

# Match exactly ' d="' with a leading space
paths = re.findall(r'<path[^>]*\sd="([^"]+)"', districts_content)

colors = ["#FF2A5F", "#00F0FF", "#FFD166", "#00F5D4", "#FF8C42", "#845EC2", "#008F7A"]

component = f"""import React, {{ useState }} from 'react';
import {{ motion }} from 'framer-motion';

export const AnimatedLondonMap = () => {{
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const paths = [
"""

for i, path in enumerate(paths):
    color = colors[i % len(colors)]
    component += f"""    {{ d: "{path}", color: "{color}" }},\n"""

component += f"""  ];

  return (
    <svg viewBox="{viewBox}" className="w-full h-full drop-shadow-xl" fill="none" stroke="currentColor">
      <g transform="{transform}">
        {{paths.map((p, i) => (
          <motion.path 
            key={{i}}
            d={{p.d}}
            initial={{{{ opacity: 0, scale: 0.8, y: 20 }}}}
            animate={{{{ opacity: 0.8, scale: 1, y: 0, fill: p.color }}}}
            transition={{{{ duration: 0.8, delay: i * 0.05, type: 'spring' }}}}
            stroke="#ffffff"
            strokeWidth="1"
            onHoverStart={{() => setHoveredIndex(i)}}
            onHoverEnd={{() => setHoveredIndex(null)}}
            style={{{{ cursor: 'pointer' }}}}
          />
        ))}}
        {{hoveredIndex !== null && (
          <motion.path
            d={{paths[hoveredIndex].d}}
            fill={{paths[hoveredIndex].color}}
            stroke="#ffffff"
            strokeWidth="3"
            initial={{{{ scale: 1, opacity: 0.8 }}}}
            animate={{{{ scale: 1.15, opacity: 1 }}}}
            transition={{{{ type: 'spring', stiffness: 400, damping: 25 }}}}
            className="pointer-events-none drop-shadow-2xl"
          />
        )}}
      </g>
    </svg>
  );
}};
"""

with open('components/LondonMap.tsx', 'w') as f:
    f.write(component)

print(f"Done generating Map component with {len(paths)} paths.")
