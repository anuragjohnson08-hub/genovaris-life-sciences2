import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePublicAssetUrl, resolveRouterBasename } from './assetUrl';

test('resolvePublicAssetUrl resolves root and GitHub Pages subpaths cleanly', () => {
  assert.equal(
    resolvePublicAssetUrl('/assets/hero-botanical.webp', '/'),
    '/assets/hero-botanical.webp',
  );
  assert.equal(
    resolvePublicAssetUrl('assets/hero-botanical.webp', '/'),
    '/assets/hero-botanical.webp',
  );
  assert.equal(
    resolvePublicAssetUrl('/assets/cards/bonebro-card.jpg', '/genovaris-site/'),
    '/genovaris-site/assets/cards/bonebro-card.jpg',
  );
  assert.equal(
    resolvePublicAssetUrl('assets/cards/bonebro-card.jpg', '/genovaris-site'),
    '/genovaris-site/assets/cards/bonebro-card.jpg',
  );
});

test('resolvePublicAssetUrl leaves external and data URLs unchanged', () => {
  assert.equal(
    resolvePublicAssetUrl('https://example.com/photo.jpg', '/genovaris-site/'),
    'https://example.com/photo.jpg',
  );
  assert.equal(
    resolvePublicAssetUrl('data:image/png;base64,abc', '/genovaris-site/'),
    'data:image/png;base64,abc',
  );
});

test('resolveRouterBasename normalizes root and repository subpaths for BrowserRouter', () => {
  assert.equal(resolveRouterBasename('/'), undefined);
  assert.equal(resolveRouterBasename('./'), undefined);
  assert.equal(resolveRouterBasename(''), undefined);
  assert.equal(resolveRouterBasename('/genovaris-site/'), '/genovaris-site');
  assert.equal(resolveRouterBasename('genovaris-site/'), '/genovaris-site');
});
