<template>
  <div>
    <h1 class="text-2xl font-bold">
      Sanity Content Example
    </h1>
    <p>This page demonstrates the use of custom serializers with Sanity content blocks.</p>
    <h2 class="text-xl font-semibold">
      SanityContent (Vue-PortableText)
    </h2>
    <p>This example uses the <a href="https://github.com/portabletext/vue-portabletext">vue-portabletext</a> library for rendering content.</p>

    <h3 class="text-lg font-semibold mt-4">
      With Automatic Image Handling
    </h3>
    <p>The images below are automatically rendered using the SanityImage component without any configuration needed!</p>
    <SanityContent :value="contentWithImages" />

    <h3 class="text-lg font-semibold mt-8">
      With Custom Components
    </h3>
    <SanityContent
      :value="value"
      :components="components"
    />
  </div>
</template>

<script setup>
import { defineComponent, defineAsyncComponent, resolveComponent, h } from 'vue'

const components = {
  types: {
    // This registered by `@nuxt/components`
    lazyRegisteredComponent: props => h(resolveComponent('LazyCustomSerializer'), {
      ...props.value,
    }),
    // An example of an inline component/directly imported component
    importedComponent: props => h(defineComponent({
      props: { someProp: String },
      render(componentProps) {
        return h('p', 'An inline/imported custom component: ' + componentProps.someProp)
      },
    }), {
      ...props.value,
    }),
    // Example of an async component
    dynamicComponent: props => h(defineAsyncComponent({
      loadingComponent: () => 'Loading...',
      loader: () => Promise.resolve(defineComponent({
        props: { someProp: String },
        render(componentProps) {
          return h('p', 'An dynamically imported custom component: ' + componentProps.someProp)
        },
      })),
    }), {
      ...props.value,
    }),
  },
}

// Content with images that will be automatically handled
const contentWithImages = [
  {
    _key: 'd810da8ac845',
    _type: 'block',
    children: [
      {
        _key: 'd810da8ac8450',
        _type: 'span',
        marks: [],
        text: 'Here is some text with an image below:',
      },
    ],
    markDefs: [],
    style: 'normal',
  },
  {
    _key: 'example-image-1',
    _type: 'image',
    asset: {
      _type: 'reference',
      _ref: 'image-G3i4emG6B8JnTmGoN0UjgAp8-300x450-jpg',
    },
    crop: {
      top: 0.1,
      bottom: 0.1,
      left: 0.1,
      right: 0.1,
    },
    hotspot: {
      x: 0.5,
      y: 0.5,
      height: 0.8,
      width: 0.8,
    },
    w: 300,
    h: 450,
  },
  {
    _key: 'd810da8ac846',
    _type: 'block',
    children: [
      {
        _key: 'd810da8ac8460',
        _type: 'span',
        marks: [],
        text: 'And here is another image with different dimensions:',
      },
    ],
    markDefs: [],
    style: 'normal',
  },
  {
    _key: 'example-image-2',
    _type: 'image',
    asset: {
      _type: 'reference',
      _ref: 'image-G3i4emG6B8JnTmGoN0UjgAp8-600x400-jpg',
    },
    w: 600,
    h: 400,
  },
]

const value = [
  {
    _type: 'lazyRegisteredComponent',
    someProp: 'some value',
  },
  {
    _type: 'importedComponent',
    someProp: 'some value',
  },
  {
    _type: 'dynamicComponent',
    someProp: 'some value',
  },
  {
    _key: 'd810da8ac845',
    _type: 'block',
    children: [
      {
        _key: 'd810da8ac8450',
        _type: 'span',
        marks: [],
        text: 'An example of ',
      },
      {
        _key: '7dc51c030a2f',
        _type: 'span',
        marks: ['strong'],
        text: 'bold',
      },
      {
        _key: '794714489c2d',
        _type: 'span',
        marks: [],
        text: ' text and ',
      },
      {
        _key: '23487f',
        _type: 'span',
        marks: ['strong'],
        text: 'another',
      },
      {
        _key: '230498a',
        _type: 'span',
        marks: [],
        text: '.',
      },
    ],
    markDefs: [],
    style: 'normal',
  },
]
</script>
