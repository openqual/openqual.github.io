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
const { OrganizationSnapshot } = require('./organization_snapshot');
const { PersonSnapshot } = require('./person_snapshot');

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
   * @param {Object<string, Array<'admin'|'officer'|'member'>>} orgMemberships
   *   Map from organization canonical ID (matching
   *   OrganizationSnapshot.source.canonicalId) to the list of OrgRoles
   *   values the user holds in that org. Un-sourced snapshots in
   *   allowedOrgs cannot be globally identified and will not match.
   *   See "Matching organizations" in schemas/signoff_policy.md.
   * @returns {boolean}
   */
  isEligible(userId, taskbookOwnerId, orgMemberships) {
    switch (this.type) {
      case SignoffPolicyType.THIS_USER:
        return userId === taskbookOwnerId;
      case SignoffPolicyType.SPECIFY_USERS:
        return this.allowedUsers.includes(userId);
      case SignoffPolicyType.ORG_MEMBERS:
        for (const org of this.allowedOrgs) {
          const canonicalId = org && org.source ? org.source.canonicalId : null;
          if (!canonicalId) continue;
          const roles = orgMemberships ? orgMemberships[canonicalId] : null;
          if (!roles) continue;
          if (this.allowedRoles.length === 0) return true;
          if (this.allowedRoles.some((r) => roles.includes(r))) return true;
        }
        return false;
      default:
        return false;
    }
  }

  /**
   * Snapshot-based alternative to isEligible. Returns whether the
   * signer is eligible to sign this policy when both the signer and
   * the taskbook owner are available as PersonSnapshot values.
   *
   * Matching uses full canonical_id + canonical_source equality on
   * the relevant source fields. Un-sourced snapshots never match.
   * See "Matching organizations" in schemas/signoff_policy.md.
   *
   * @param {PersonSnapshot} signer
   * @param {PersonSnapshot} taskbookOwner
   * @returns {boolean}
   */
  isEligibleFor(signer, taskbookOwner) {
    const sSource = signer && signer.source ? signer.source : null;
    const oSource = taskbookOwner && taskbookOwner.source ? taskbookOwner.source : null;

    switch (this.type) {
      case SignoffPolicyType.THIS_USER:
        if (!sSource || !oSource) return false;
        if (!sSource.canonicalId || !oSource.canonicalId) return false;
        if (!sSource.canonicalSource || !oSource.canonicalSource) return false;
        return sSource.canonicalId === oSource.canonicalId &&
               sSource.canonicalSource === oSource.canonicalSource;

      case SignoffPolicyType.SPECIFY_USERS: {
        const id = sSource ? sSource.canonicalId : null;
        if (!id) return false;
        return this.allowedUsers.includes(id);
      }

      case SignoffPolicyType.ORG_MEMBERS: {
        const memberships = (signer && signer.memberships) || [];
        for (const allowed of this.allowedOrgs) {
          const a = allowed && allowed.source ? allowed.source : null;
          if (!a || !a.canonicalId || !a.canonicalSource) continue;
          for (const membership of memberships) {
            const org = membership ? membership.organization : null;
            const m = org && org.source ? org.source : null;
            if (!m || !m.canonicalId || !m.canonicalSource) continue;
            if (a.canonicalId === m.canonicalId &&
                a.canonicalSource === m.canonicalSource) {
              if (this.allowedRoles.length === 0) return true;
              if (this.allowedRoles.some((r) => membership.roles.includes(r))) return true;
            }
          }
        }
        return false;
      }

      default:
        return false;
    }
  }

  /**
   * Returns true iff the policy is in a compliant state per the signing
   * contract in schemas/signoff_policy.md.
   *
   * - An unsigned policy (completed = false) is always compliant.
   * - A signed policy is compliant iff completionTimestamp and
   *   signoffRecord are both set and signoffRecord.signedAt equals
   *   completionTimestamp.
   * @returns {boolean}
   */
  isValidSigned() {
    if (!this.completed) return true;
    if (this.completionTimestamp == null) return false;
    if (this.signoffRecord == null) return false;
    const a = this.signoffRecord.signedAt;
    const b = this.completionTimestamp;
    if (a === b) return true;
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    return false;
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
