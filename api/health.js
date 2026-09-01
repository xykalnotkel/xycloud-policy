import policy from '../data/policy.json' with { type: 'json' };

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    ok: true,
    service: 'xycloud-policy-api',
    status: 'operational',
    policyVersion: policy.meta.version,
    lastUpdated: policy.meta.updated,
    sections: policy.sections.length,
    faq: policy.faq.length,
    endpoints: {
      policy: '/api/policy',
      index: '/api/policy?format=index',
      section: '/api/policy?section=promosi',
      markdown: '/api/policy?format=markdown',
      html: '/api/policy?format=html',
      text: '/api/policy?format=text',
      embed: '/embed.js',
      docs: '/docs.html'
    },
    license: 'MIT',
    attribution: 'Credit required: https://rules.xyc.my.id',
    timestamp: new Date().toISOString()
  });
}
