import { extendVue } from '../vue'

// eslint-disable-next-line
import type { SanityConfiguration } from '..'

const baseURL = 'https://cdn.sanity.io/images'

export const SanityImage = extendVue({
  name: 'SanityImage',
  functional: true,
  props: {
    assetId: { type: String, required: true },
    projectId: {
      type: String,
      default: null,
    },
    dataset: {
      type: String,
      default: null,
    },
    /**
     * Set auto=format to automatically return an image in webp formatting if the browser supports it.
     */
    auto: { type: String },
    /**
     * Fill in any transparent areas in the image with a color. The string must be resolve to a valid hexadecimal color (RGB, ARGB, RRGGBB, or AARRGGBB). E.g. bg=ff00 for red background with no transparency.
     */
    bg: { type: String },
    /**
     * Blur 0-100.
     */
    blur: {
      type: [Number, String],
      validator: value => Number(value) >= 0 && Number(value) <= 100,
    },
    /**
       * Use with fit=crop to specify how cropping is performed:
          - top, bottom, left and right: The crop starts from the edge specified. crop=top,left will crop the image starting in the top left corner.
          - center: Will crop around the center of the image
          - focalpoint: Will crop around the focal point specified using the fp-x and fp-y parameters.
          - entropy: Attempts to preserve the "most important" part of the image by selecting the crop that preserves the most complex part of the image.
       */
    crop: {
      type: String,
      validator: value =>
        [
          'top',
          'bottom',
          'left',
          'right',
          'center',
          'focalpoint',
          'entropy',
        ].includes(value),
    },
    /**
     * Configures the headers so that opening this link causes the browser to download the image rather than showing it. The browser will suggest to use the file name you provided.
     */
    dl: { type: String },
    /**
     * Specifies device pixel ratio scaling factor. From 1 to 3.
     */
    dpr: {
      type: [Number, String],
      validator: value => [1, 2, 3].includes(Number(value)),
    },
    /**
       * Affects how the image is handled when you specify target dimensions.
          - `clip`: The image is resized to fit within the bounds you specified without cropping or distorting the image.
          - `crop`: Crops the image to fill the size you specified when you specify both w and h
          - `fill`: Like clip, but the any free area not covered by your image is filled with the color specified in the bg parameter.
          - `fillmax`: Places the image within box you specify, never scaling the image up. If there is excess room in the image, it is filled with the color specified in the bg parameter.
          - `max`: Fit the image within the box you specify, but never scaling the image up.
          - `scale`: Scales the image to fit the constraining dimensions exactly. The resulting image will fill the dimensions, and will not maintain the aspect ratio of the input image.
          - `min`: Resizes and crops the image to match the aspect ratio of the requested width and height. Will not exceed the original width and height of the image.
       */
    fit: {
      type: String,
      validator: value =>
        ['clip', 'crop', 'fill', 'fillmax', 'max', 'scale', 'min'].includes(
          value,
        ),
    },
    /**
     * Flipping. Flip image horizontally, vertically or both. Possible values: h, v, hv
     */
    flip: {
      type: String,
      validator: value => ['h', 'v', 'hv'].includes(value),
    },
    /**
     * Convert image to jpg, pjpg, png, or webp.
     */
    fm: {
      type: String,
      validator: value => ['jpg', 'pjpg', 'png', 'webp'].includes(value),
    },
    /**
     * Focal Point X. Specify a center point to focus on when cropping the image. Values from 0.0 to 1.0 in fractions of the image dimensions. (See crop)
     */
    fpX: {
      type: [Number, String],
      validator: value => Number(value) <= 1.0 && Number(value) >= 0,
    },
    /**
     * Focal Point Y. Specify a center point to focus on when cropping the image. Values from 0.0 to 1.0 in fractions of the image dimensions. (See crop)
     */
    fpY: {
      type: [Number, String],
      validator: value => Number(value) <= 1.0 && Number(value) >= 0,
    },
    /**
     * Height of the image in pixels. Scales the image to be that tall.
     */
    h: { type: [Number, String] },
    /**
     * Invert the image.
     */
    invert: { type: Boolean },
    /**
     * Maximum height. Specifies size limits giving the backend some freedom in picking a size according to the source image aspect ratio.
     */
    maxH: { type: [Number, String] },
    /**
     * Maximum width. Specifies size limits giving the backend some freedom in picking a size according to the source image aspect ratio.
     */
    maxW: { type: [Number, String] },
    /**
     * Minimum height. Specifies size limits giving the backend some freedom in picking a size according to the source image aspect ratio.
     */
    minH: { type: [Number, String] },
    /**
     * Minimum width. Specifies size limits giving the backend some freedom in picking a size according to the source image aspect ratio.
     */
    minW: { type: [Number, String] },
    /**
     * Orientation. Possible values: 0, 90, 180 or 270.Rotate the image in 90 degree increments.
     */
    or: {
      type: [Number, String],
      validator: value => [0, 90, 180, 270].includes(Number(value)),
    },
    /**
     * Quality 0-100. Specify the compression quality (where applicable).
     */
    q: {
      type: [Number, String],
      validator: value => Number(value) >= 0 && Number(value) <= 100,
    },
    /**
     * Crop the image according to the provided coordinates (in pixel units of the source image).
     */
    rect: { type: String },
    /**
     * Saturation. Currently the asset pipeline only supports sat=-100, which renders the image with grayscale colors. Support for more levels of saturation is planned for later.
     */
    sat: { type: [Number, String] },
    /**
     * Sharpen 0-100.
     */
    sharpen: {
      type: [Number, String],
      validator: value => Number(value) >= 0 && Number(value) <= 100,
    },
    /**
     * Width of the image in pixels. Scales the image to be that wide.
     */
    w: { type: [Number, String] },
  },
  render (h, { props, data, parent, scopedSlots }) {
    const keys: Array<keyof typeof props> = [
      'auto',
      'bg',
      'blur',
      'crop',
      'dl',
      'dpr',
      'fit',
      'flip',
      'fm',
      'fpX',
      'fpY',
      'h',
      'invert',
      'maxH',
      'maxW',
      'minH',
      'minW',
      'or',
      'q',
      'rect',
      'sat',
      'sharpen',
      'w',
    ]

    const queryParams = keys
      .map((prop) => {
        const urlFormat = prop.replace(/[A-Z]/, r => '-' + r.toLowerCase())
        return props[prop] ? `${urlFormat}=${props[prop]}` : undefined
      })
      .filter(Boolean)
      .join('&')

    const parts = props.assetId.split('-').slice(1)
    const format = parts.pop()

    const projectId = props.projectId || (parent && parent.$sanity.config.projectId)
    const dataset = props.dataset || (parent.$sanity && parent.$sanity.config.dataset) || 'production'

    const src = `${baseURL}/${projectId}/${dataset}/${parts.join(
      '-',
    )}.${format}${queryParams ? '?' + queryParams : ''}`

    const renderRawImage = () =>
      h('img', {
        ...data,
        attrs: {
          ...data.attrs,
          src,
        },
      })

    return scopedSlots.default
      ? scopedSlots.default({ src }) || renderRawImage()
      : renderRawImage()
  },
})

export default SanityImage
