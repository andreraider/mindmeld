import {environment} from './environments/environment';

export class Endpoints {

  // Authentication
  public static auth = environment.backendUrl + '/auth/token';

  // Statistics
  public static statistics = environment.backendUrl + '/statistics';

  public static statistic(id: number): string {
    return environment.backendUrl + `/statistics/${id}`;
  }
}
