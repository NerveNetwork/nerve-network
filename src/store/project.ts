import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  getProjectDetail,
  getProjectFileList,
  getProjectSocial,
  getFollowedTwitters as getFollowedTwittersApi,
  getSocialFeatures,
  getSocialTemplates,
  unbindSocial,
  twitterAuthorization,
  getAgentPersonality as getAgentPersonalityApi,
  telegramAuthorization
} from '@/service/api'
import {
  IProject,
  IProjectFile,
  ISocial,
  SocialType,
  ISocialSetting,
  IFollowedAccount,
  ISocialTemplate,
  ISocialOutItem
} from '@/service/api/types'
import useToast from '@/hooks/useToast'
import { useWalletStore } from './wallet'

interface ProjectState {
  project: IProject | null
  fileList: IProjectFile[]
  socials: ISocial[]
  twitterSettings: ISocialSetting[]
  trackAccounts: IFollowedAccount[]
  twitterTemplates: ISocialTemplate[]
  tweetList: ISocialOutItem[],
  telegramSettings: ISocialSetting[]
  telegramTemplates: ISocialTemplate[]
}
const sortArr = ['TWITTER', 'Discord', 'Telegram']

export const useProjectStore = defineStore('project', () => {
  const { toastSuccess, toastError } = useToast()
  const wallet = useWalletStore()

  const project = ref<IProject | null>(null)
  const fileList = ref<IProjectFile[]>([])
  const socials = ref<ISocial[]>([])
  const twitterSettings = ref<ISocialSetting[]>([])
  const trackAccounts = ref<IFollowedAccount[]>([])
  const twitterTemplates = ref<ISocialTemplate[]>([])
  const tweetList = ref<ISocialOutItem[]>([])
  const telegramSettings = ref<ISocialSetting[]>([])
  const telegramTemplates = ref<ISocialTemplate[]>([])

  const twitter = computed(() => {
    const tw = socials.value.find(v => v.type === SocialType.TWITTER)
    // return { ...tw, bind: true, username: 'Aa' }
    return tw
  })
  const telegram = computed(() => {
    const tg = socials.value.find(v => v.type === SocialType.Telegram)
    return tg
  })
  const discord = computed(() => {
    return socials.value.find(v => v.type === SocialType.Discord)
  })


  const getProject = async (projectId: string) => {
    const res = await getProjectDetail(projectId)
    project.value = res
  }

  const getProjectFiles = async (projectId: string) => {
    const res = await getProjectFileList(projectId)
    fileList.value = res.map(v => ({ ...v, loading: false }))
  }

  const getProjectSocials = async (projectId: string) => {
    const res = await getProjectSocial(projectId)
    res.sort((a, b) => {
      const indexA = sortArr.indexOf(a.type)
      const indexB = sortArr.indexOf(b.type)
      return indexA < indexB ? -1 : 1
    })
    socials.value = res
  }

  // twitter
  const getAgentPersonality = async () => {
    await getAgentPersonalityApi()
  }

  const getTwitterSettings = async (projectId: string) => {
    const res = await getSocialFeatures(projectId, 'Twitter')
    twitterSettings.value = res
  }

  const getFollowedTwitters = async (projectId: string) => {
    const res = await getFollowedTwittersApi(projectId)
    trackAccounts.value = res.map(v => ({ ...v, loading: false }))
  }

  const getTwitterTemplates = async (projectId: string) => {
    const res = await getSocialTemplates(projectId, 'Twitter')
    twitterTemplates.value = res
  }

  const authorizeTwitter = async (projectId: string) => {
    if (twitter.value?.bind) {
      try {
        await unbindSocial(projectId, SocialType.TWITTER)
        socials.value.map(v => {
          if (v.type === SocialType.TWITTER) {
            v.bind = false
          }
        })
        toastSuccess('Success')
      } catch (e) {
        toastError(e)
      }
    } else {
      twitterAuthorization(
        projectId,
        wallet.user!.token,
        window.location.href
      )
    }
  }

  // telegram
  const geTelegramSettings = async (projectId: string) => {
    const res = await getSocialFeatures(projectId, 'Telegram')
    telegramSettings.value = res
  }

  const getTelegramTemplates = async (projectId: string) => {
    const res = await getSocialTemplates(projectId, 'Telegram')
    telegramTemplates.value = res
  }

  const authorizeTelegram =async (projectId: string, botToken: string) => {
    if (telegram.value?.bind) {
      try {
        await unbindSocial(projectId, SocialType.Telegram)
        socials.value.map(v => {
          if (v.type === SocialType.Telegram) {
            v.bind = false
          }
        })
        toastSuccess('Success')
      } catch (e) {
        toastError(e)
      }
    } else {
      try {
        await telegramAuthorization(
          projectId,
          botToken
        )
        socials.value.map(v => {
          if (v.type === SocialType.Telegram) {
            v.bind = true
          }
        })
        toastSuccess('Success')
      } catch (e) {
        toastError(e)
      }
    }
  }

  return {
    project,
    fileList,
    socials,
    twitterSettings,
    trackAccounts,
    twitterTemplates,
    tweetList,
    telegramSettings,
    telegramTemplates,
    twitter,
    telegram,
    discord,
    getProject,
    getProjectFiles,
    getProjectSocials,
    getAgentPersonality,
    getTwitterSettings,
    getFollowedTwitters,
    getTwitterTemplates,
    authorizeTwitter,
    geTelegramSettings,
    getTelegramTemplates,
    authorizeTelegram
  }
})

export const useProjectStore1 = defineStore('project', {
  state: (): ProjectState => ({
    project: null,
    fileList: [],
    socials: [],
    twitterSettings: [],
    trackAccounts: [],
    twitterTemplates: [],
    tweetList: [],
    telegramSettings: [],
    telegramTemplates: [],
  }),

  getters: {
    twitter: state => {
      const tw = state.socials.find(v => v.type === SocialType.TWITTER)
      // return { ...tw, bind: true, username: 'Aa' }
      return tw
    },
    telegram: state => {
      const tg = state.socials.find(v => v.type === SocialType.Telegram)
      return tg
    },
    discord: state => {
      return state.socials.find(v => v.type === SocialType.Discord)
    },
  },

  actions: {
    async getProject(projectId: string) {
      const res = await getProjectDetail(projectId)
      this.project = res
    },

    async getProjectFiles(projectId: string) {
      const res = await getProjectFileList(projectId)
      this.fileList = res.map(v => ({ ...v, loading: false }))
    },

    async getProjectSocials(projectId: string) {
      const res = await getProjectSocial(projectId)
      res.sort((a, b) => {
        const indexA = sortArr.indexOf(a.type)
        const indexB = sortArr.indexOf(b.type)
        return indexA < indexB ? -1 : 1
      })
      this.socials = res
    },

    async getAgentPersonality() {
      await getAgentPersonalityApi()
    },

    // twitter
    async getTwitterSettings(projectId: string) {
      const res = await getSocialFeatures(projectId, 'TWITTER')
      this.twitterSettings = res
    },

    async getFollowedTwitters(projectId: string) {
      const res = await getFollowedTwittersApi(projectId)
      this.trackAccounts = res.map(v => ({ ...v, loading: false }))
    },

    async getTwitterTemplates(projectId: string) {
      const res = await getSocialTemplates(projectId, 'TWITTER')
      this.twitterTemplates = res
    },

    async authorizeTwitter(projectId: string) {
      const wallet = useWalletStore()
      const { toastSuccess, toastError } = useToast()
      if (this.twitter?.bind) {
        try {
          await unbindSocial(projectId, SocialType.TWITTER)
          this.socials.map(v => {
            if (v.type === SocialType.TWITTER) {
              v.bind = false
            }
          })
          toastSuccess('Success')
        } catch (e) {
          toastError(e)
        }
      } else {
        twitterAuthorization(
          projectId,
          wallet.user!.token,
          window.location.href
        )
      }
    },

    // telegram
    async geTelegramSettings(projectId: string) {
      const res = await getSocialFeatures(projectId, 'Telegram')
      this.telegramSettings = res
    },

    async getTelegramTemplates(projectId: string) {
      const res = await getSocialTemplates(projectId, 'Telegram')
      this.telegramTemplates = res
    },

    async authorizeTelegram(projectId: string, botToken: string) {
      const wallet = useWalletStore()
      const { toastSuccess, toastError } = useToast()
      if (this.telegram?.bind) {
        try {
          await unbindSocial(projectId, SocialType.Telegram)
          this.socials.map(v => {
            if (v.type === SocialType.Telegram) {
              v.bind = false
            }
          })
          toastSuccess('Success')
        } catch (e) {
          toastError(e)
        }
      } else {
        try {
          await telegramAuthorization(
            projectId,
            botToken
          )
          this.socials.map(v => {
            if (v.type === SocialType.Telegram) {
              v.bind = true
            }
          })
          toastSuccess('Success')
        } catch (e) {
          toastError(e)
        }
      }
    }
  }
})
