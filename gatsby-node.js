/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */


const dateFormat = require('date-fns/format');
const path = require('path');
const _isEmpty = require('lodash/isEmpty');
const dotenv = require('dotenv');

const configPostCss = path.resolve(__dirname, './');

dotenv.config({
  path: `.env.${process.env.NODE_ENV}`
});

exports.onCreateWebpackConfig = ({
  actions
}) => {
  actions.setWebpackConfig({
    module: {
      rules: [
        {
          test: /\.(s(a|c)ss|css)$/,
          loaders: [
            {
              loader: 'sass-resources-loader',
              options: {
                resources: path.resolve(__dirname, './src/nucleon/protons.scss')
              }
            }
          ]
        },
        {
          test: /\.(woff|woff2|eot|ttf|svg)$/,
          include: configPostCss,
          use: 'url-loader'
        }
      ]
    }
  });
};

exports.onCreateNode = ({
  node, actions
}) => {
  if (node.internal.type === 'node__article' || node.internal.type === 'node__page') {
    const { createNodeField } = actions;

    // Create a slug value as a field on the node.
    createNodeField({
      node,
      name: 'slug',
      value: node.path.alias.substr(1)
    });

    // Create a formatted date field on the node.
    createNodeField({
      node,
      name: 'created_formatted',
      value: dateFormat(new Date(node.created * 1000), 'MMMM Do, YYYY')
    });
  }
};

// Implement the Gatsby API “createPages”. This is called once the
// data layer is bootstrapped to let plugins create pages from data.
exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions;

  return new Promise((resolve, reject) => {
    const articleTemplate = path.resolve('./src/components/templates/article/index.js');
    const pageTemplate = path.resolve('./src/components/templates/page/index.js');
    const tagsTemplate = path.resolve('./src/components/templates/tags/index.js');
    // page building queries
    graphql(
      `
        {
          allTaxonomyTermTags {
            edges {
              node {
                name
                tid
                path {
                  alias
                }
                relationships{
                  node__article{
                    nid
                  }
                }
              }
            }
          }

          allNodeArticle {
            edges {
              node {
                title
                path {
                  alias
                }
                body {
                  value
                }
                fields {
                  slug
                }
              }
            }
          }

          allNodePage {
            edges {
              node {
                title
                path {
                  alias
                }
                body {
                  value
                }
                fields {
                  slug
                  created_formatted
                  markdownBody {
                    childMarkdownRemark {
                      html
                    }
                  }
                }
              }
            }
          }
      
        }
        `
    ).then((result) => {
      if (result.errors) {
        reject(result.errors);
      }
      // pages for each node__article
      result.data.allNodeArticle.edges.forEach(({ node }) => {
        createPage({
          path: node.path.alias,
          component: articleTemplate,
          context: {
            slug: node.fields.slug
          }
        });
      });

      // pages for each node__page
      result.data.allNodePage.edges.forEach(({ node }) => {
        createPage({
          path: node.path.alias,
          component: pageTemplate,
          context: {
            slug: node.fields.slug
          }
        });
      });

      // pages for each tag-term
      result.data.allTaxonomyTermTags.edges.forEach(({ node }) => {
        if (!_isEmpty(node.relationships.node__article)) {
          createPage({
            path: `/tags${node.path.alias}`,
            component: tagsTemplate,
            context: {
              slug: node.path.alias
            }
          });
        }
      });

      resolve();
    });
  });
};
