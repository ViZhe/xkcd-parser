
import fs from 'fs'
import mongoose, {Schema} from 'mongoose'
import config from './config.gitsecret'


mongoose.Promise = global.Promise
mongoose.connect(config.databases.mongo)

const postSchema = new Schema({
  num: {
    type: Number,
    required: true
  },
  locales: {
    type: Object,
    required: true
  }
}, {
  toJSON: {
    versionKey: false,
    virtuals: true
  }
})
const Post = mongoose.model('Post', postSchema)

const foldersArr = fs.readdirSync('./result')
foldersArr.forEach(async (num) => {
  try {
    const pathToFile = `./result/${num}/${num}.json`
    if (!fs.existsSync(pathToFile)) {
      return
    }
    const data = JSON.parse(fs.readFileSync(pathToFile).toString())
    const foundPost = await Post.findOne({num})
    if (foundPost) {
      console.error(1, num)
      await Post.update({
        _id: foundPost.id,
        ...data
      })
    } else {
      console.error(num)
      await Post.create(data)
    }
  } catch (e) {
    console.error(e)
  }
})

// mongoose.disconnect()
