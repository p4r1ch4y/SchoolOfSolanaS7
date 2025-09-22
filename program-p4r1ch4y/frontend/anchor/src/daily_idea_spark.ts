/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/daily_idea_spark.json`.
 */
export type DailyIdeaSpark = {
  "address": "FsL6UpQExpY4ZqLosQFMU9RFiictPhss63nnxvf61djv",
  "metadata": {
    "name": "dailyIdeaSpark",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "getStreak",
      "docs": [
        "Get the current streak (read-only)"
      ],
      "discriminator": [
        83,
        143,
        240,
        10,
        140,
        65,
        58,
        40
      ],
      "accounts": [
        {
          "name": "journal",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  106,
                  111,
                  117,
                  114,
                  110,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "initializeJournal",
      "docs": [
        "Initialize a new journal for the user"
      ],
      "discriminator": [
        244,
        168,
        68,
        26,
        128,
        220,
        118,
        153
      ],
      "accounts": [
        {
          "name": "journal",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  106,
                  111,
                  117,
                  114,
                  110,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "logIdea",
      "docs": [
        "Log a new idea and update streak"
      ],
      "discriminator": [
        28,
        108,
        71,
        148,
        96,
        237,
        19,
        199
      ],
      "accounts": [
        {
          "name": "journal",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  106,
                  111,
                  117,
                  114,
                  110,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "ideaText",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "journal",
      "discriminator": [
        246,
        141,
        106,
        208,
        98,
        92,
        66,
        208
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorized",
      "msg": "You are not authorized to access this journal"
    },
    {
      "code": 6001,
      "name": "alreadyInitialized",
      "msg": "Journal already exists for this user"
    },
    {
      "code": 6002,
      "name": "ideaTooLong",
      "msg": "Idea text is too long (max 280 characters)"
    },
    {
      "code": 6003,
      "name": "emptyIdea",
      "msg": "Idea text cannot be empty"
    }
  ],
  "types": [
    {
      "name": "ideaLog",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "text",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "journal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "streak",
            "type": "u64"
          },
          {
            "name": "lastLogged",
            "type": "i64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "lastIdea",
            "type": "string"
          },
          {
            "name": "ideas",
            "type": {
              "vec": {
                "defined": {
                  "name": "ideaLog"
                }
              }
            }
          }
        ]
      }
    }
  ]
};
