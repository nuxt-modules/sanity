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
    <SanityContent
      :value
      :components
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
