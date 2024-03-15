export type Bindings = {
  REVIEW_NOI: KVNamespace;
};

export interface Tenant {
  id: string;
  name: string;
  contactPoint: ContactPoint;
}

export enum ContactPointType {
  DISCORD = "DISCORD",
}

export interface ContactPoint {
  type: ContactPointType;
  webhookUrl: string;
  userMap: Record<string, string>;
}

export interface PullRequest {
  action: string;
  number: number;
  pull_request: {
    html_url: string;
    title: string;
    body: string;
    user: {
      login: string;
    };
    requested_reviewers: {
      login: string;
    }[];
  };
  repository: {
    full_name: string;
    html_url: string;
  };
}
