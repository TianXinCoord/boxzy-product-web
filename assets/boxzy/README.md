# BOXZY reusable product assets

All four files are RGBA PNGs with a real alpha channel and no baked-in UI text,
buttons, prices, navigation, or page background.

| File | Size | Intended use |
| --- | --- | --- |
| `box-discovery.png` | 1254 × 1254 | Discovery tier product card, modal, mobile carousel |
| `box-collector.png` | 1254 × 1254 | Collector tier product card, modal, mobile carousel |
| `box-vault.png` | 1254 × 1254 | Vault tier product card, modal, mobile carousel |
| `banner-product-group.png` | 1672 × 941 | Default hero using supplied real sealed-product photos |
| `banner-real-products.png` | 1672 × 941 | Named copy of the real-product hero composition |
| `banner-product-group-concept.png` | 1672 × 941 | Archived fictional BOXZY product concept |
| `empty-presentation-tray.png` | 1672 × 941 | Empty tray for future inventory compositions |

The three individual boxes share the same camera angle, scale, and lighting so
they can be swapped within one component without visual jumps. Keep marketing
headlines and CTAs as HTML rather than baking them into these images.

The default banner uses the supplied source-product photos as direct composited
cutouts; their packaging was not regenerated. Source images and reusable cutouts
are stored under `real-products/`. The Legendary Treasures source is only
200 × 254, so it should be replaced if a higher-resolution original becomes
available.
