'use client';
import Image from 'next/image';
import { useRef } from 'react';
import { useFeaturesAnimations } from './animations';
export default function Features() {
  const rootRef = useRef<HTMLDivElement>(null);
  useFeaturesAnimations(rootRef);
  return (
    <div className="container" id="features" data-section="features" ref={rootRef}>
      <div className="title-grid">
        <div className="title-wrapper">
          <div className="section-title">
            <div className="fade-in-on-scroll" data-anim="0">
              <h2 className="title">Everything it pulls from a page</h2>
            </div>
          </div>
          <div className="section-paragraph">
            <div className="fade-in-on-scroll" data-anim="1">
              <p>
                One request returns a complete, structured design system — measured from the
                actually-rendered page, not guessed at from the markup.
              </p>
            </div>
          </div>
        </div>
        <div className="title-buttons-holder" data-anim="2">
          <a href="#top" className="button white-button w-button">
            Extract a site
          </a>
          <a href="#how-it-works" className="button w-button">
            How it works
          </a>
        </div>
      </div>
      <div className="card-grid-holder">
        <div className="w-layout-grid card-grid">
          <div className="colored-block">
            <div className="card-content-holder">
              <div className="feature-grid-content">
                <div className="feature-grid-content-holder card-feature" data-anim="3">
                  <div className="feature-grid-title">Colors & color roles</div>
                  <p className="no-margins">
                    The full palette plus semantic roles — background, surface, text, primary, border.
                  </p>
                </div>
              </div>
            </div>
            <div className="card-image-holder" data-anim="4">
              <Image
                className="card-image"
                src="/images/2750ebe319e0.png"
                alt=""
                loading="lazy"
                data-anim="5"
                width={1132}
                height={530}
              />
            </div>
          </div>
          <div className="colored-block">
            <div className="card-content-holder">
              <div className="feature-grid-content">
                <div className="feature-grid-content-holder card-feature" data-anim="6">
                  <div className="feature-grid-title">Typography & text styles</div>
                  <p>Font families, sizes and weights, plus ready-to-apply h1–body recipes.</p>
                </div>
              </div>
            </div>
            <div className="card-image-holder" data-anim="7">
              {/* plain <img>: next/image rejects this particular SVG ("received null") */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="card-image"
                src="/images/img1.svg"
                alt=""
                loading="lazy"
                data-anim="8"
                width={622}
                height={621}
              />
            </div>
          </div>
        </div>
        <div className="w-layout-grid card-grid reverse">
          <div className="colored-block">
            <div className="card-content-holder">
              <div className="feature-grid-content">
                <div className="feature-grid-content-holder card-feature" data-anim="9">
                  <div className="feature-grid-title">Spacing, radii & shadows</div>
                  <p className="no-margins">
                    The spacing scale, corner radii and elevation — de-duped and ranked by use.
                  </p>
                </div>
              </div>
            </div>
            <div className="card-image-holder" data-anim="10">
              <Image
                className="card-image"
                src="/images/26b6abcc3bc9.png"
                alt=""
                loading="lazy"
                data-anim="11"
                width={1132}
                height={803}
              />
            </div>
          </div>
          <div className="colored-block">
            <div className="card-content-holder">
              <div className="feature-grid-content">
                <div className="feature-grid-content-holder card-feature" data-anim="12">
                  <div className="feature-grid-title">Fonts & a style profile</div>
                  <p className="no-margins">
                    Each font with its role and share of on-page text, plus a derived style brief.
                  </p>
                </div>
              </div>
            </div>
            <div className="card-image-holder" data-anim="13">
              <Image
                className="card-image"
                src="/images/27d8cdf3c7e5.png"
                alt=""
                loading="lazy"
                data-anim="14"
                width={1132}
                height={531}
              />
            </div>
          </div>
        </div>
        <div className="colored-block">
          <div className="w-layout-grid new-features-grid">
            <div className="feature-grid-content left-padding">
              <div className="feature-grid-content-holder-2" data-anim="15">
                <div className="feature-grid-title-h2">Hand it straight to your AI</div>
                <p>
                  Copy the JSON and drop it into your prompt — the AI gets the brand&apos;s real
                  colors, type scale and spacing instead of guessing.
                </p>
              </div>
            </div>
            <div className="feature-grid-image-holder">
              <Image
                loading="lazy"
                alt=""
                src="/images/a0c09660c001.png"
                className="feature-image"
                data-anim="16"
                width={1132}
                height={866}
              />
              <div className="fade-in-on-scroll _100width" data-anim="17">
                <a href="#top" className="button cta-button w-button">
                  Extract a site
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
