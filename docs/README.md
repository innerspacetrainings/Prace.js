## Prace website generator

### Installation

You'll need [bundler](https://bundler.io/) (and Ruby).

Run `bundle install --path vendor`.

Then run `bundle exec jekyll serve` to serve the website and watch changes.

To build (although is not necessary for deployment) use `bundle exec jekyll build`. Your website will be available on `_site` directory.

### Deployment

[GitHub supports Jekyll](https://jekyllrb.com/docs/github-pages/) so it's not necessary to build or do anything else, 
just with pushing this into the `docs` directory, GitHub will build and deploy the website automatically.