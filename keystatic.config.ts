import { config, fields } from '@keystatic/core';

export default config({
  storage: {
    kind: 'local',
  },
  collections: {
    blog: {
      label: '博客文章',
      slugField: 'title',
      path: 'src/content/blog/*',
      format: { extension: 'mdx' },
      entryLayout: 'content',
      schema: {
        title: fields.slug({
          name: { label: '标题' },
          slug: { label: 'URL Slug' },
        }),
        description: fields.text({
          label: '描述',
          validation: { length: { min: 10, max: 200 } },
        }),
        date: fields.date({
          label: '发布日期',
          validation: { isRequired: true },
        }),
        tags: fields.multiselect({
          label: '标签',
          options: [
            { label: '前端', value: '前端' },
            { label: 'CSS', value: 'CSS' },
            { label: 'Astro', value: 'Astro' },
            { label: 'Tailwind', value: 'Tailwind' },
            { label: '动效', value: '动效' },
            { label: '设计', value: '设计' },
            { label: '部署', value: '部署' },
            { label: 'Cloudflare', value: 'Cloudflare' },
            { label: 'DevOps', value: 'DevOps' },
            { label: '入门', value: '入门' },
            { label: '博客', value: '博客' },
            { label: '框架', value: '框架' },
          ],
        }),
        heroImage: fields.text({
          label: '头图 URL',
        }),
        draft: fields.checkbox({
          label: '草稿',
        }),
      },
    },
  },
});
