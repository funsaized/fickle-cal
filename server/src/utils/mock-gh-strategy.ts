import passport from "passport";
import { type Profile as GitHubProfile } from "passport-github2";

// The reply from Github OAuth2
import user from "./gh-mock-profile";

export default class MockGHStrategy extends passport.Strategy {
  _cb: (
    accessToken: string,
    refreshToken: string,
    profile: GitHubProfile,
    done: (a: unknown, user: Express.User | false) => void
  ) => void;
  _user: GitHubProfile;

  constructor(name: string, cb: any) {
    super();

    this.name = name;
    this._cb = cb;
    this._user = user;
  }

  /**
   * Authenticate a request.
   *
   * `this.success(user, info)`, `this.fail(challenge, status)`,
   * `this.redirect(url, status)`, `this.pass()`, or `this.error(err)`.
   * https://github.com/jaredhanson/passport-strategy#augmented-methods.
   *
   * @param {Object} req - Request.
   * @param {Object} options - The options object passed to `passport.authenticate()`.
   * @return {void}
   */
  authenticate(req: any, options: any) {
    this._cb("N/A", "N/A", this._user, (err: any, user: any) => {
      this.success(user);
    });
  }
}
