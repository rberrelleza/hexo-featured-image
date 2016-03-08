var fs = require('hexo-fs');
var yaml = require('yaml-front-matter');

var contentJsonPath = hexo.public_dir + 'content.json';
var post_asset_folder = hexo.config.post_asset_folder;
var imagesPath = '/';
if (!post_asset_folder) {
	if (hexo.config.image_dir) {
		imagesPath += hexo.config.image_dir;
	} else {
		imagesPath += 'images';
	}
	imagesPath += '/';
}

hexo.extend.filter.register('before_post_render', function(data) {
	var featured_image = yaml.loadFront(data.raw).featured_image;
	if (featured_image){
		console.log('has featured image', featured_image);
		if (post_asset_folder) {
			data.featured_image = data.permalink + featured_image;
		} else {
			data.featured_image = hexo.config.url + imagesPath + featured_image;
		}
	}
	console.log('data.featured_image after', data.featured_image);
	return data;
});

hexo.extend.filter.register('before_exit', function() {
	// to work smoothly with hexo_generator_json_content
	var jsonContentCfg = hexo.config.hasOwnProperty('jsonContent') ? hexo.config.jsonContent : {
		meta: true
	};
	var postsCfg = jsonContentCfg.hasOwnProperty('posts') ? jsonContentCfg.posts : {};

	if (postsCfg.featured_image && fs.existsSync(contentJsonPath)) {

		var postsObject = {};
		var posts = hexo.locals.get('posts');
		posts.forEach(function(post) {
			postsObject[post.path] = post;
		});
		var content = JSON.parse(fs.readFileSync(contentJsonPath));
		var contentPosts = content.posts;
		if (!contentPosts) return;
		content.posts = contentPosts.map(function(post) {
			var fullPost = postsObject[post.path];
			if (fullPost && fullPost.featured_image) {
				if (post_asset_folder) {
					post.featured_image = fullPost.permalink + fullPost.featured_image;
				} else {
					post.featured_image = hexo.config.url + imagesPath + fullPost.featured_image;
				}
			}
			return post;
		});
		fs.writeFileSync(contentJsonPath, JSON.stringify(content));
	}
});
