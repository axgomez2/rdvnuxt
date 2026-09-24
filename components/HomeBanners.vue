<template>
  <section v-if="visible" class="w-full">
    <div class="relative overflow-hidden bg-stone-900">
      <!-- Slides -->
      <div
        class="flex transition-transform duration-700 ease-in-out"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
      >
        <div
          v-for="banner in banners"
          :key="banner.id"
          class="w-full flex-shrink-0"
        >
          <component
            :is="banner.link_url ? 'a' : 'div'"
            :href="banner.link_url || undefined"
            :target="banner.open_in_new_tab ? '_blank' : undefined"
            :rel="banner.open_in_new_tab ? 'noopener noreferrer' : undefined"
            class="block relative group"
          >
            <img
              :src="resolveImageUrl(banner)"
              :alt="banner.title || 'Banner'"
              class="w-full h-auto object-contain"
              loading="eager"
            />
              <!-- Overlay com texto opcional -->
              <div
                v-if="banner.title || banner.subtitle"
                class="absolute inset-0 flex flex-col justify-end p-4 md:p-8 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
              >
                <h2 v-if="banner.title" class="text-white text-xl md:text-3xl font-bold mb-1">
                  {{ banner.title }}
                </h2>
                <p v-if="banner.subtitle" class="text-stone-200 text-sm md:text-base">
                  {{ banner.subtitle }}
                </p>
              </div>
            </component>
          </div>
        </div>

        <!-- Setas (apenas se houver mais de 1) -->
        <template v-if="banners.length > 1">
          <button
            type="button"
            @click="prev"
            class="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-9 h-9 md:w-11 md:h-11 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
            aria-label="Anterior"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <button
            type="button"
            @click="next"
            class="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-9 h-9 md:w-11 md:h-11 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
            aria-label="Próximo"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>

          <!-- Indicadores -->
          <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <button
              v-for="(banner, idx) in banners"
              :key="banner.id"
              type="button"
              @click="goTo(idx)"
              :class="[
                'h-2 rounded-full transition-all',
                idx === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
              ]"
              :aria-label="`Ir para banner ${idx + 1}`"
            ></button>
          </div>
        </template>
      </div>
  </section>
</template>

<script setup lang="ts">
interface Banner {
  id: number
  title?: string
  subtitle?: string
  image_url?: string
  image_path?: string
  link_url?: string
  open_in_new_tab?: boolean
}

const config = useRuntimeConfig()
const banners = ref<Banner[]>([])
const currentIndex = ref(0)
const loaded = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

const visible = computed(() => loaded.value && banners.value.length > 0)

const backendOrigin = computed(() =>
  (config.public.apiBase as string || '').replace(/\/api\/?$/, '')
)

const resolveImageUrl = (banner: Banner) => {
  const raw = banner.image_url || (banner.image_path ? `/storage/${banner.image_path}` : '')
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw)) return raw
  return `${backendOrigin.value}${raw.startsWith('/') ? '' : '/'}${raw}`
}

const next = () => {
  if (!banners.value.length) return
  currentIndex.value = (currentIndex.value + 1) % banners.value.length
  restartTimer()
}

const prev = () => {
  if (!banners.value.length) return
  currentIndex.value = (currentIndex.value - 1 + banners.value.length) % banners.value.length
  restartTimer()
}

const goTo = (idx: number) => {
  currentIndex.value = idx
  restartTimer()
}

const startTimer = () => {
  if (banners.value.length <= 1) return
  timer = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % banners.value.length
  }, 6000)
}

const restartTimer = () => {
  if (timer) clearInterval(timer)
  startTimer()
}

const fetchBanners = async () => {
  try {
    const response = await $fetch<{ data: Banner[] }>('/home-banners', {
      baseURL: config.public.apiBase as string
    })
    banners.value = response.data || []
  } catch {
    banners.value = []
  } finally {
    loaded.value = true
    startTimer()
  }
}

onMounted(fetchBanners)
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>
