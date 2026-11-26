# SHD Floating Books — integration reference

This is an original, dependency-free implementation of three parallax planes inspired by Olivier Larose's tutorial, with independent CSS idle motion. It is not a copy of his repository. The demo's SVG covers and registration link are placeholders, not production assets or functioning authentication.

## Preview
Run `python -m http.server 8080` in this directory and open http://localhost:8080/demo.html. Test with a moving mouse and then with no input. The center text stays fixed; the three parent planes move at 1 : 0.5 : 0.25; each book also moves on its own CSS animation. Pause button and reduced-motion are supported.

## Integrate into Next.js / React (adapt to actual project)
Copy floating-books.js and floating-books.css into the project's appropriate directories. Import the CSS where permitted by the project (global stylesheet or app layout in Next.js). Do not replace existing Hero content, typography, CTA routes, or other sections. Use real local SHD assets, not the demo SVGs. Keep 8–9 cover URLs in a stable array, preferably declared outside render. Use the existing optimized asset pipeline as appropriate. Example wrapper:

```jsx
'use client';
import { useEffect, useRef } from 'react';
import { mountFloatingBooks } from './floating-books';
// import the stylesheet via the project's existing CSS entry point
export default function FloatingHero({ covers, children }) {
  const scene = useRef(null);
  const layer = useRef(null);
  useEffect(() => {
    return mountFloatingBooks(scene.current, layer.current, covers);
  }, [covers]);
  return (
    <section ref={scene} className="shd-fb-scene">
      <div ref={layer} className="shd-fb-background" aria-hidden="true" />
      <div className="shd-fb-content">{children}</div>
      <button type="button" className="shd-fb-pause" data-fb-pause>Tạm dừng chuyển động</button>
    </section>
  );
}
```

If the Hero already has a section root, attach the two refs and classes to the existing structure rather than adding a duplicate section. Use the existing hero background color for `--shd-hero-bg`. Ensure no opaque overlay above the books or global transform rules override animation. Add existing hero layout styles to `.shd-fb-content` to center the whole content block. For TypeScript projects convert the module to `.ts` with DOM types or provide a declaration file.

## Acceptance checks (run on the actual SHD site)
1. Browser with prefers-reduced-motion=no-preference: keep pointer still for 2s and compare computed transforms on `.shd-fb-book img`; at least one visible book must change. Do not accept a static screenshot as evidence.
2. Move pointer from center to right; read computed transforms on `[data-plane="0"]`, `1` and `2`; nonzero movement and approximate 1:0.5:0.25 ratios required. Move out; planes ease to zero.
3. Check that foreground content position does not move. Click original CTA and verify real routing.
4. Check pause and resume, reduced-motion, mobile, viewport exit, hidden tab, cleanup on navigation and no horizontal overflow. Inspect console; run project build/lint/typecheck.
5. Save a short screen recording or Playwright trace and numerical transform samples from the real app. Report failures instead of claiming completion.

Original technical reference: https://blog.olivierlarose.com/tutorials/floating-image-gallery
