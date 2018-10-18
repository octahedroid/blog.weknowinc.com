import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'gatsby';
import ReactHtmlParser from 'react-html-parser';
import Img from 'gatsby-image';
import Layout from '../layout';
import './style.scss';

const dateFormat = require('date-fns/format');

const { PROJECT_URL } = process.env;

const Page = ({ data }) => (
  <Layout
    showFooterCta
    darkMenu
    postUrl={PROJECT_URL}
    postTitle={data.allSiteSettingEntitySite.edges[0].node.field_name}
    postDesc={data.allSiteSettingEntitySite.edges[0].node.field_description}
    postDate={dateFormat(new Date(), 'MMMM Do, YYYY')}
  >
    <div className="c-page u-push-top--inside--9x u-push-bottom--inside--4x">
      <div className="grid-container align-center">
        <div className="c-page__content cell medium-10 large-8 xlarge-8 small-11 grid-x grid-margin-x align-center">
          <div className="cell medium-6 small-11 large-6">
            <Img
              fluid={
                  data.nodePage.relationships.field_image.relationships.field_media_image.localFile.childImageSharp.fluid
                }
              alt={data.allSiteSettingEntitySite.edges[0].node.field_name}
            />
          </div>
          <div className="cell medium-6 small-11 large-6">
            <h1 className="c-page__title">{data.nodePage.title}</h1>
            { ReactHtmlParser(data.nodePage.fields.markdownBody.childMarkdownRemark.html) }
          </div>
        </div>
      </div>
    </div>
  </Layout>
);
export default Page;

export const query = graphql`
  query($slug: String!) {
    allSiteSettingEntitySite {
      edges {
        node {
          field_name
          field_slogan
          field_description
        }
      }
    }
    nodePage(fields:{slug:{eq:$slug}}){
      title
      path {
        alias
      }
      fields {
        slug
        created_formatted
        markdownBody {
          childMarkdownRemark {
            html
            rawMarkdownBody
          }
        }
      }
      relationships {
        field_image {
          relationships {
            field_media_image {
              localFile {
                publicURL
                childImageSharp {
                  fluid(maxWidth: 520 maxHeight: 520, cropFocus: CENTER) {
                    ...GatsbyImageSharpFluid
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

Page.propTypes = {
  data: PropTypes.object
};

Page.defaultProps = {
  data: null
};
