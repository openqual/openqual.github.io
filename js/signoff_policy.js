// Copyright 2026 FireCal LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const { SignoffPolicyType } = require('./enums');

class SignoffPolicy {
  constructor({
    id,
    type,
    allowedUsers = [],
    allowedOrgs = [],
    allowedRoles = [],
    completed = false,
    completionTimestamp = null,
    signoffRecord = null,
  }) {
    this.id = id;
    this.type = type;
    this.allowedUsers = Object.freeze([...allowedUsers]);
    this.allowedOrgs = Object.freeze([...allowedOrgs]);
    this.allowedRoles = Object.freeze([...allowedRoles]);
    this.completed = completed;
    this.completionTimestamp = completionTimestamp;
    this.signoffRecord = signoffRecord;
    Object.freeze(this);
  }

  /**
   * @param {string} userId
   * @param {string} taskbookOwnerId
   * @param {Object<string, string[]>} orgMemberships map from orgId to role list
   * @returns {boolean}
   */
  isEligible(userId, taskbookOwnerId, orgMemberships) {
    switch (this.type) {
      case SignoffPolicyType.THIS_USER:
        return userId === taskbookOwnerId;
      case SignoffPolicyType.SPECIFY_USERS:
        return this.allowedUsers.includes(userId);
      case SignoffPolicyType.ORG_MEMBERS:
        for (const orgId of this.allowedOrgs) {
          const roles = orgMemberships ? orgMemberships[orgId] : null;
          if (!roles) continue;
          if (this.allowedRoles.length === 0) return true;
          if (this.allowedRoles.some((r) => roles.includes(r))) return true;
        }
        return false;
      default:
        return false;
    }
  }
}

/**
 * Returns true if a policy list is satisfied given a require-all flag.
 * Empty policy list is always OK.
 */
function signoffsOK(policies, requireAll) {
  if (!policies || policies.length === 0) return true;
  return requireAll
    ? policies.every((p) => p.completed)
    : policies.some((p) => p.completed);
}

module.exports = { SignoffPolicy, signoffsOK };
