import { useEffect } from 'react';

export function SEOHead() {
  useEffect(() => {
    // Set document title
    document.title = '神預測 Prediction God - 台灣最熱門的預測市場平台';

    // Set meta tags
    const metaTags = [
      { name: 'description', content: '神預測 (Prediction God) 是台灣最受歡迎的預測市場平台，讓你預測政治、科技、娛樂、體育等各領域未來事件。免費參與，使用 G coin 進行預測交易。' },
      { name: 'keywords', content: '預測市場,神預測,Prediction God,台灣預測,政治預測,科技預測,娛樂預測,體育預測,加密貨幣預測,G coin' },
      { name: 'author', content: 'Prediction God' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      
      // Open Graph
      { property: 'og:title', content: '神預測 Prediction God - 台灣最熱門的預測市場平台' },
      { property: 'og:description', content: '預測政治、科技、娛樂、體育等各領域未來事件。免費參與，使用 G coin 進行預測交易。' },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: '神預測 Prediction God' },
      { property: 'og:locale', content: 'zh_TW' },
      
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: '神預測 Prediction God - 台灣最熱門的預測市場平台' },
      { name: 'twitter:description', content: '預測政治、科技、娛樂、體育等各領域未來事件。免費參與，使用 G coin 進行預測交易。' },
    ];

    metaTags.forEach(({ name, property, content }) => {
      const meta = document.createElement('meta');
      if (name) meta.name = name;
      if (property) meta.setAttribute('property', property);
      meta.content = content;
      document.head.appendChild(meta);
    });

    // Add structured data (JSON-LD)
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      'name': '神預測 Prediction God',
      'description': '台灣最受歡迎的預測市場平台',
      'applicationCategory': 'GameApplication',
      'operatingSystem': 'Web',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'TWD'
      },
      'inLanguage': 'zh-TW'
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      // Remove added meta tags on unmount
      metaTags.forEach(({ name, property }) => {
        const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
        const meta = document.querySelector(selector);
        if (meta) meta.remove();
      });
      
      // Remove structured data script
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(s => s.remove());
    };
  }, []);

  return null;
}
