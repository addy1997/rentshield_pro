import urllib.request
import re

url = "https://upload.wikimedia.org/wikipedia/commons/d/df/Greater_London_UK_district_map_%28blank%29.svg"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
svg_content = urllib.request.urlopen(req).read().decode('utf-8')

# Extract paths and viewBox
viewBox_match = re.search(r'viewBox="([^"]+)"', svg_content)
viewBox = viewBox_match.group(1) if viewBox_match else "0 0 1000 1000"

paths = re.findall(r'<path[^>]*d="([^"]+)"', svg_content)

component = f"""import React from 'react';
import {{ motion }} from 'framer-motion';

export const AnimatedLondonMap = () => {{
  return (
    <svg viewBox="{viewBox}" className="w-full h-full drop-shadow-xl" fill="none" stroke="currentColor">
"""

colors = ["#FF2A5F", "#00F0FF", "#FFD166", "#00F5D4", "#FF8C42", "#845EC2", "#008F7A"]

for i, path in enumerate(paths):
    color = colors[i % len(colors)]
    component += f"""      <motion.path 
        d="{path}"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 0.8, scale: 1, y: 0, fill: "{color}" }}
        transition={{ duration: 0.8, delay: {i * 0.05}, type: 'spring' }}
        whileHover={{ opacity: 1, scale: 1.05, zIndex: 10, strokeWidth: 2 }}
        stroke="#ffffff"
        strokeWidth="1"
      />
"""

component += """    </svg>
  );
};
"""

with open('src/components/LondonMap.tsx', 'w') as f:
    f.write(component)

print("Done generating Map component.")
