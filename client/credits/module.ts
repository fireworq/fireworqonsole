import { Action } from 'redux'

enum ActionNames {
  CREDITS_RETRIEVED = 'credits/retrieved',
  FETCH_STARTED = 'credits/fetch_started',
  FETCH_FINISHED = 'credits/fetch_finished'
}

interface CreditsRetrievedAction extends Action {
  type: ActionNames.CREDITS_RETRIEVED
  packages: PackageInfo[]
}
export const creditsRetrieved =
  (packages: PackageInfo[]): CreditsRetrievedAction => ({
    type: ActionNames.CREDITS_RETRIEVED,
    packages
  });

interface FetchStartedAction extends Action {
  type: ActionNames.FETCH_STARTED
}
export const fetchStarted =
  (): FetchStartedAction => ({
    type: ActionNames.FETCH_STARTED
  });

interface FetchFinishedAction extends Action {
  type: ActionNames.FETCH_FINISHED
}
export const fetchFinished =
  (): FetchFinishedAction => ({
    type: ActionNames.FETCH_FINISHED
  });

export type CreditsActions = CreditsRetrievedAction
                           | FetchStartedAction
                           | FetchFinishedAction;

export interface PackageInfo {
  package: string
  url: string
  license: string
};

export interface CreditsState {
  packages: PackageInfo[]
  loadingCount: number
};

const initialState: CreditsState = {
  packages: [],
  loadingCount: 0
};

export default function reducer(
  state: CreditsState = initialState,
  action: CreditsActions
): CreditsState {
  switch (action.type) {
    case ActionNames.CREDITS_RETRIEVED:
      return {
        ...state,
        packages: action.packages
      };
    case ActionNames.FETCH_STARTED:
      return {
        ...state,
        loadingCount: state.loadingCount + 1
      };
    case ActionNames.FETCH_FINISHED:
      return {
        ...state,
        loadingCount: state.loadingCount - 1
      };
    default:
      return state;
  }
}
