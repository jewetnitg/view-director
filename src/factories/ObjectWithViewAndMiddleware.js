import _ from 'lodash';
import {ObjectWithView} from 'frontend-view';

/**
 * @todo document
 * @class ObjectWithViewAndMiddleware
 */
const ObjectWithViewAndMiddleware = ObjectWithView.extend({

  name: 'ObjectWithViewAndMiddleware',

  events: true,

  validate: ['viewDirector'],

  defaults: {
    data: [],
    security: []
  },

  prototype: {

    /**
     * @todo document
     * @param params
     * @param data
     */
    middleware(params = {}, data = {}) {
      return this.options.viewDirector.security(this.options.security, params)
        .then(() => {
          this.executionContext = this.options.viewDirector.data(this.options.data, params, data, this.sync.bind(this));

          return this.executionContext.then(data => {
              return data;
            }, error => {
              // 'internal' error, data middleware failed, 'this shouldn't happen' were his famous last words
              return Promise.reject({
                code: 500,
                error
              });
            });
        }, error => {
          // security error, this is expected to sometimes reject
          return Promise.reject({
            code: 403,
            error
          });
        })
    },

    /**
     * @todo document
     * @param params
     * @param data
     * @param force
     */
    render(params = {}, data = {}, force = false) {
      return this.middleware(params, data, this.sync.bind(this))
        .then(data => {
          ObjectWithView.prototype.render.call(this, data, force);
        }, (err) => {
          this.hide();
          return Promise.reject(err);
        });
    }

  }

});

export default ObjectWithViewAndMiddleware;