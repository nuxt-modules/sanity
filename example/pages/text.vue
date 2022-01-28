<template>
  <div>
    <SanityContent :blocks="blocks" />
  </div>
</template>
<script>
export default {
  name: 'TextPage',
  data () {
    return {
      blocks: [
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
      ],
    }
  },
}
</script>
