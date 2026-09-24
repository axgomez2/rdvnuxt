<template>
  <div class="min-h-screen bg-white">
    <!-- Loading -->
    <div v-if="loading" class="container mx-auto px-4 py-16 text-center">
      <div class="inline-block w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-4 text-stone-500">Carregando disco...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="container mx-auto px-4 py-16 text-center">
      <svg class="w-16 h-16 text-stone-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <h2 class="text-xl font-semibold text-stone-600 mb-2">Disco não encontrado</h2>
      <p class="text-stone-400 mb-6">{{ error }}</p>
      <NuxtLink to="/" class="inline-flex items-center gap-2 bg-yellow-400 text-stone-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        Voltar à Home
      </NuxtLink>
    </div>

    <!-- Content -->
    <div v-else-if="vinyl" class="container mx-auto px-4 py-6 md:py-10">
      <!-- Breadcrumb -->
      <nav class="mb-6 text-sm">
        <ol class="flex items-center gap-2 text-stone-500">
          <li><NuxtLink to="/" class="hover:text-yellow-600 transition-colors">Home</NuxtLink></li>
          <li><span class="mx-1">/</span></li>
          <li><NuxtLink :to="listingRoute" class="hover:text-yellow-600 transition-colors">{{ listingLabel }}</NuxtLink></li>
          <li><span class="mx-1">/</span></li>
          <li class="text-stone-700 truncate">{{ vinyl.title }}</li>
        </ol>
      </nav>

      <!-- Main Content (4/8 grid no desktop) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        <!-- Imagem -->
        <div class="lg:col-span-4 space-y-4">
          <div class="relative aspect-square bg-stone-100 overflow-hidden shadow-md max-w-xs sm:max-w-sm mx-auto lg:max-w-none">
            <img
              :src="selectedImage || coverImage"
              :alt="vinyl.title"
              class="w-full h-full object-cover cursor-zoom-in"
              @error="handleImageError"
              @click="showZoom = true"
            />

            <!-- Botão de zoom -->
            <button
              type="button"
              @click="showZoom = true"
              class="absolute top-3 right-3 w-9 h-9 bg-white/90 hover:bg-white text-stone-700 rounded-full flex items-center justify-center shadow transition-colors"
              title="Ampliar imagem"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m-3-3h6"/>
              </svg>
            </button>

            <!-- Badges -->
            <div class="absolute top-4 left-4 flex flex-col gap-2">
              <span v-if="vinyl.is_preorder" class="bg-purple-600 text-white text-sm font-bold px-3 py-1.5 rounded-lg">
                PRÉ-VENDA
              </span>
              <span v-else-if="vinyl.is_new && vinyl.in_stock" class="bg-green-600 text-white text-sm font-bold px-3 py-1.5 rounded-lg">
                NOVO
              </span>
              <span v-if="vinyl.is_promotional" class="bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg">
                OFERTA
              </span>
              <span v-if="!vinyl.in_stock && !vinyl.is_preorder" class="bg-stone-600 text-white text-sm font-bold px-3 py-1.5 rounded-lg">
                ESGOTADO
              </span>
            </div>

            <!-- Play Button Overlay -->
            <button
              v-if="vinyl.has_playable_tracks"
              @click="openPlayer"
              class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
            >
              <div class="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                <svg class="w-10 h-10 text-stone-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </button>
          </div>

          <!-- Galeria de imagens (se houver) -->
          <div v-if="vinyl.images && vinyl.images.length > 1" class="flex gap-2 overflow-x-auto pb-2">
            <button
              v-for="(img, index) in vinyl.images"
              :key="index"
              @click="selectedImage = resolveImageUrl(img.url)"
              class="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors"
              :class="selectedImage === resolveImageUrl(img.url) ? 'border-yellow-500' : 'border-stone-200'"
            >
              <img :src="resolveImageUrl(img.url)" :alt="`Imagem ${Number(index) + 1}`" class="w-full h-full object-cover" />
            </button>
          </div>
        </div>

        <!-- Info -->
        <div class="lg:col-span-8 space-y-6">
          <!-- Artista e Título -->
          <div>
            <NuxtLink
              :to="artistRoute"
              class="text-yellow-600 text-lg font-medium hover:text-yellow-700 transition-colors"
            >
              {{ vinyl.artist }}
            </NuxtLink>
            <h1 class="text-3xl md:text-4xl font-bold text-stone-900 mt-1">{{ vinyl.title }}</h1>
            <div class="flex flex-wrap items-center gap-3 mt-3 text-stone-600">
              <NuxtLink
                v-if="vinyl.record_label"
                :to="labelRoute"
                class="inline-flex items-center gap-2 hover:text-yellow-700 transition-colors"
              >
                <img
                  v-if="vinyl.record_label_data?.logo"
                  :src="resolveImageUrl(vinyl.record_label_data.logo)"
                  :alt="vinyl.record_label"
                  class="h-6 w-6 rounded-full object-cover bg-stone-100 border border-stone-200"
                  @error="($event.target as HTMLImageElement).style.display='none'"
                />
                <span>{{ vinyl.record_label }}</span>
              </NuxtLink>
              <span v-if="vinyl.record_label && vinyl.release_year" class="text-stone-400">•</span>
              <span v-if="vinyl.release_year">{{ vinyl.release_year }}</span>
              <span v-if="vinyl.country" class="text-stone-400">•</span>
              <span v-if="vinyl.country">{{ vinyl.country }}</span>
            </div>
          </div>

          <!-- Preço e Ações -->
          <div class="bg-stone-50 border border-stone-200 rounded-xl p-6 space-y-4">
            <!-- Preço -->
            <div class="flex items-baseline gap-3">
              <span class="text-3xl font-bold text-stone-900">{{ formattedPrice }}</span>
              <span v-if="vinyl.is_promotional && vinyl.formatted_original_price" class="text-xl text-stone-500 line-through">
                {{ vinyl.formatted_original_price }}
              </span>
              <span v-if="vinyl.is_promotional && discountPercent > 0" class="bg-red-500 text-white text-sm font-bold px-2 py-1 rounded">
                {{ discountPercent }}% OFF
              </span>
            </div>

            <!-- Data de lançamento (pré-venda) -->
            <div v-if="vinyl.is_preorder && vinyl.formatted_release_date" class="flex items-center gap-2 text-purple-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span>Lançamento: {{ vinyl.formatted_release_date }}</span>
            </div>

            <!-- Estoque -->
            <div class="flex items-center gap-2">
              <span v-if="vinyl.in_stock" class="flex items-center gap-1 text-green-600">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                Em estoque
              </span>
              <span v-else-if="vinyl.is_preorder" class="flex items-center gap-1 text-purple-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Disponível para reserva
              </span>
              <span v-else class="flex items-center gap-1 text-stone-500">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                Esgotado
              </span>
            </div>

            <!-- Botões de Ação -->
            <div class="flex flex-col sm:flex-row gap-3 pt-2">
              <!-- Comprar / Reservar -->
              <button
                @click="addToCart"
                :disabled="!vinyl.can_buy"
                class="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :class="isInCart ? 'bg-green-500 text-white hover:bg-green-400' : 'bg-yellow-400 text-stone-900 hover:bg-yellow-300'"
              >
                <svg v-if="!isInCart" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                {{ isInCart ? 'Adicionado ao Carrinho' : (vinyl.is_preorder ? 'Reservar' : 'Comprar') }}
              </button>

              <!-- Wishlist / Wantlist -->
              <button
                @click="toggleList"
                class="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-colors"
                :class="listButtonClass"
              >
                <svg v-if="vinyl.show_wishlist" class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
                <span class="hidden sm:inline">{{ listButtonText }}</span>
              </button>
            </div>

            <!-- Comprar pelo WhatsApp -->
            <button
              @click="buyOnWhatsApp"
              class="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-lg bg-green-600 text-white hover:bg-green-500 transition-colors"
            >
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm5.56-2.107c-.3-.15-1.767-.872-2.04-.972-.273-.099-.472-.148-.67.15-.198.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.297-.019-.458.13-.606.134-.133.3-.347.448-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              </svg>
              Comprar pelo WhatsApp
            </button>

            <!-- Compartilhar -->
            <div class="flex items-center justify-center gap-3 pt-2">
              <span class="text-stone-500 text-sm">Compartilhar:</span>
              <button @click="shareOnWhatsApp" class="p-2.5 bg-green-600 text-white rounded-full hover:bg-green-500 transition-colors" title="WhatsApp">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                </svg>
              </button>
              <button @click="shareOnFacebook" class="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-colors" title="Facebook">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              <button @click="shareOnTwitter" class="p-2.5 bg-black text-white rounded-full hover:bg-gray-800 transition-colors" title="X (Twitter)">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </button>
              <button @click="copyLink" class="p-2.5 bg-stone-200 text-stone-700 rounded-full hover:bg-stone-300 transition-colors" title="Copiar link">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Tracklist -->
          <div v-if="vinyl.tracks && vinyl.tracks.length" class="bg-white border border-stone-200 rounded-xl p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-stone-900">Faixas</h3>
              <button
                v-if="vinyl.has_playable_tracks"
                @click="openPlayer"
                class="flex items-center gap-2 text-yellow-600 hover:text-yellow-700 transition-colors text-sm font-medium"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Ouvir todas
              </button>
            </div>

            <div class="space-y-1 max-h-80 overflow-y-auto">
              <div
                v-for="track in vinyl.tracks"
                :key="track.id || track.position"
                class="flex items-center gap-3 p-2.5 rounded-lg hover:bg-stone-50 transition-colors group"
              >
                <span class="w-6 text-center text-stone-400 text-sm font-medium">{{ track.position }}</span>

                <div class="flex-1 min-w-0">
                  <p class="text-stone-800 truncate text-sm">{{ track.name || `Faixa ${track.position}` }}</p>
                </div>

                <span v-if="track.duration" class="text-stone-500 text-xs">{{ track.duration }}</span>

                <button
                  v-if="track.has_audio || track.audio_url"
                  @click="playTrack(track)"
                  class="w-8 h-8 rounded-full bg-yellow-400 text-stone-900 flex items-center justify-center hover:bg-yellow-300 transition-colors flex-shrink-0"
                  title="Ouvir faixa"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
                <span
                  v-else
                  class="text-xs px-2 py-1 bg-stone-100 text-stone-500 rounded flex-shrink-0"
                >
                  Sem áudio
                </span>
              </div>
            </div>
          </div>

          <!-- Detalhes do Disco -->
          <div class="bg-white border border-stone-200 rounded-xl p-6">
            <h3 class="text-lg font-semibold text-stone-900 mb-4">Detalhes</h3>
            <dl class="grid grid-cols-2 gap-4 text-sm">
              <div v-if="vinyl.condition">
                <dt class="text-stone-500">Condição</dt>
                <dd class="text-stone-800 font-medium">
                  <span class="px-2 py-0.5 rounded text-xs" :class="conditionClass">{{ vinyl.condition }}</span>
                </dd>
              </div>
              <div v-if="vinyl.format">
                <dt class="text-stone-500">Formato</dt>
                <dd class="text-stone-800">{{ vinyl.format }}</dd>
              </div>
              <div v-if="vinyl.speed">
                <dt class="text-stone-500">Velocidade</dt>
                <dd class="text-stone-800">{{ vinyl.speed }} RPM</dd>
              </div>
              <div v-if="vinyl.num_discs">
                <dt class="text-stone-500">Discos</dt>
                <dd class="text-stone-800">{{ vinyl.num_discs }}</dd>
              </div>
              <div v-if="vinyl.color">
                <dt class="text-stone-500">Cor</dt>
                <dd class="text-stone-800">{{ vinyl.color }}</dd>
              </div>
              <div v-if="vinyl.edition">
                <dt class="text-stone-500">Edição</dt>
                <dd class="text-stone-800">{{ vinyl.edition }}</dd>
              </div>
              <div v-if="vinyl.catalog_number">
                <dt class="text-stone-500">Catálogo</dt>
                <dd class="text-stone-800 font-mono text-xs">{{ vinyl.catalog_number }}</dd>
              </div>
              <div v-if="vinyl.barcode">
                <dt class="text-stone-500">Código de Barras</dt>
                <dd class="text-stone-800 font-mono text-xs">{{ vinyl.barcode }}</dd>
              </div>
              <div v-if="vinyl.media_status">
                <dt class="text-stone-500">Estado da Mídia</dt>
                <dd class="text-stone-800">{{ vinyl.media_status }}</dd>
              </div>
              <div v-if="vinyl.cover_status">
                <dt class="text-stone-500">Estado da Capa</dt>
                <dd class="text-stone-800">{{ vinyl.cover_status }}</dd>
              </div>
            </dl>
          </div>

          <!-- Gêneros e Estilos -->
          <div v-if="(vinyl.genres && vinyl.genres.length) || (vinyl.styles && vinyl.styles.length)" class="bg-white border border-stone-200 rounded-xl p-6">
            <h3 class="text-lg font-semibold text-stone-900 mb-4">Gêneros & Estilos</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="genre in vinyl.genres"
                :key="genre"
                class="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
              >
                {{ genre }}
              </span>
              <span
                v-for="style in vinyl.styles"
                :key="style"
                class="px-3 py-1.5 bg-stone-100 text-stone-700 rounded-full text-sm"
              >
                {{ style }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Descrição / Notas -->
      <div v-if="vinyl.description || vinyl.notes" class="mt-10 bg-white border border-stone-200 rounded-xl p-6">
        <h3 class="text-xl font-semibold text-stone-900 mb-4">Sobre este disco</h3>
        <p class="text-stone-700 whitespace-pre-line leading-relaxed">{{ vinyl.description || vinyl.notes }}</p>
      </div>

      <!-- Carrossel: Discos relacionados (estilo Netflix) -->
      <div v-if="relatedVinyls.length" class="mt-10">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-stone-900">
            {{ vinyl.store_section === 'dj' ? 'Mais Discos de DJ' : 'Mais Álbuns' }}
            <span v-if="vinyl.category?.name" class="text-stone-500 font-normal text-base">em {{ vinyl.category.parent?.name || vinyl.category.name }}</span>
          </h3>
          <NuxtLink
            v-if="vinyl.category"
            :to="relatedCategoryRoute"
            class="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
          >
            Ver todos
          </NuxtLink>
        </div>

        <div class="relative group">
          <!-- Setas de navegação (desktop) -->
          <button
            type="button"
            @click="scrollRelated(-1)"
            class="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-10 h-10 bg-white shadow-lg border border-stone-200 rounded-full items-center justify-center text-stone-700 hover:bg-stone-50 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Anterior"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <button
            type="button"
            @click="scrollRelated(1)"
            class="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-10 h-10 bg-white shadow-lg border border-stone-200 rounded-full items-center justify-center text-stone-700 hover:bg-stone-50 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Próximo"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>

          <div
            ref="relatedScroller"
            class="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
          >
            <div
              v-for="item in relatedVinyls"
              :key="item.id"
              class="flex-shrink-0 w-48 sm:w-56 snap-start"
            >
              <VinylCard :vinyl="item" />
            </div>
          </div>
        </div>
      </div>

      </div>

    <!-- Modal de Zoom da imagem -->
    <div
      v-if="showZoom && vinyl"
      class="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
      @click="showZoom = false"
    >
      <button
        type="button"
        class="absolute top-4 right-4 w-10 h-10 bg-white/90 hover:bg-white text-stone-800 rounded-full flex items-center justify-center shadow-lg"
        @click.stop="showZoom = false"
        aria-label="Fechar"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
      <img
        :src="selectedImage || coverImage"
        :alt="vinyl.title"
        class="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        @click.stop
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import { usePlayerStore } from '~/stores/player'
import { useWishlistStore } from '~/stores/wishlist'
import { useWantlistStore } from '~/stores/wantlist'
import { useAuthStore } from '~/stores/auth'
import { useSiteSettingsStore } from '~/stores/siteSettings'
import type { Vinyl, Track } from '~/types'

const route = useRoute()
const siteSettingsStore = useSiteSettingsStore()
const config = useRuntimeConfig()
const cartStore = useCartStore()
const playerStore = usePlayerStore()
const wishlistStore = useWishlistStore()
const wantlistStore = useWantlistStore()
const authStore = useAuthStore()

const vinyl = ref<Vinyl | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const selectedImage = ref<string | null>(null)
const showZoom = ref(false)

// Dados relacionados
const relatedVinyls = ref<Vinyl[]>([])
const relatedScroller = ref<HTMLElement | null>(null)

// Placeholder
const PLACEHOLDER_IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#f5f5f4"/><circle cx="200" cy="200" r="120" fill="#e7e5e4"/><circle cx="200" cy="200" r="40" fill="#d6d3d1"/><circle cx="200" cy="200" r="8" fill="#a8a29e"/></svg>`
)

// Resolver URL de imagem (relativas apontam para o backend)
const backendOrigin = computed(() =>
  (config.public.apiBase as string || '').replace(/\/api\/?$/, '')
)

const resolveImageUrl = (raw?: string | null) => {
  if (!raw) return PLACEHOLDER_IMG
  if (/^https?:\/\//i.test(raw)) return raw
  if (raw.startsWith('data:')) return raw
  return `${backendOrigin.value}${raw.startsWith('/') ? '' : '/'}${raw}`
}

const coverImage = computed(() => resolveImageUrl(vinyl.value?.cover_image || vinyl.value?.image_url))

// Carrossel de relacionados (estilo Netflix)
const scrollRelated = (direction: number) => {
  const el = relatedScroller.value
  if (!el) return
  const cardWidth = (el.firstElementChild as HTMLElement)?.offsetWidth || 224
  const gap = 16
  el.scrollBy({ left: direction * (cardWidth + gap) * 2, behavior: 'smooth' })
}

// Gerar slug para URLs
const generateSlug = (text?: string) => {
  if (!text) return ''
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Rotas para artista e gravadora
const artistRoute = computed(() => {
  if (!vinyl.value) return '/'
  return `/artista/${generateSlug(vinyl.value.artist)}`
})

const labelRoute = computed(() => {
  if (!vinyl.value?.record_label) return '/'
  return `/gravadora/${generateSlug(vinyl.value.record_label)}`
})

// Breadcrumb aponta para a listagem correta
const listingRoute = computed(() => {
  if (vinyl.value?.is_preorder) return '/discos-novos/pre-venda'
  return vinyl.value?.is_new ? '/discos-novos' : '/discos-usados'
})

const listingLabel = computed(() => {
  if (vinyl.value?.is_preorder) return 'Pré-Venda'
  return vinyl.value?.is_new ? 'Discos Novos' : 'Discos Usados'
})

const relatedCategoryRoute = computed(() => {
  const slug = vinyl.value?.category?.parent?.slug || vinyl.value?.category?.slug
  if (!slug) return listingRoute.value
  return { path: listingRoute.value === '/discos-novos/pre-venda' ? '/discos-novos' : listingRoute.value, query: { category: slug } }
})

// Extrair ID da URL (formato: titulo-ID)
const extractIdFromSlug = (slug: string) => {
  const match = slug.match(/-(\d+)$/)
  return match ? match[1] : slug
}

const fetchVinyl = async () => {
  loading.value = true
  error.value = null

  try {
    const slug = route.params.slug as string
    const id = extractIdFromSlug(slug)

    const response = await $fetch<{ data: Vinyl }>(`/vinyls/${id}`, {
      baseURL: config.public.apiBase
    })
    vinyl.value = response.data

    // Inicializa selectedImage: preferência para imagem local is_primary,
    // depois cover_image (que já resolve a hierarquia no backend)
    const primaryImg = vinyl.value.images?.find((img: any) => img.is_primary)
    selectedImage.value = primaryImg ? resolveImageUrl(primaryImg.url) : null

    // Buscar dados relacionados
    fetchRelatedData()
  } catch (err: any) {
    error.value = err.data?.message || 'Disco não encontrado'
  } finally {
    loading.value = false
  }
}

const fetchRelatedData = async () => {
  if (!vinyl.value) return

  try {
    const relatedResponse = await $fetch<{ data: Vinyl[] }>(`/vinyls/${vinyl.value.id}/related`, {
      baseURL: config.public.apiBase,
      params: { limit: 8 }
    }).catch(() => ({ data: [] }))
    relatedVinyls.value = relatedResponse.data || []
  } catch (err) {
    console.error('Erro ao buscar dados relacionados:', err)
  }
}

// Computed
const isInWishlist = computed(() => vinyl.value ? wishlistStore.isInWishlist(vinyl.value.id) : false)
const isInWantlist = computed(() => vinyl.value ? wantlistStore.isInWantlist(vinyl.value.id) : false)
const isInCart = computed(() => vinyl.value ? cartStore.items.some(item => item.vinyl_stock_id === vinyl.value!.id) : false)

const isInList = computed(() => {
  if (!vinyl.value) return false
  return vinyl.value.show_wishlist ? isInWishlist.value : isInWantlist.value
})

const formattedPrice = computed(() => {
  if (vinyl.value?.formatted_price) return vinyl.value.formatted_price
  if (vinyl.value?.price != null) return `R$ ${vinyl.value.price.toFixed(2).replace('.', ',')}`
  return 'R$ 0,00'
})

const discountPercent = computed(() => {
  if (!vinyl.value || !vinyl.value.is_promotional || !vinyl.value.original_price) return 0
  return Math.round((1 - vinyl.value.price! / vinyl.value.original_price) * 100)
})

const conditionClass = computed(() => {
  if (!vinyl.value) return ''
  return vinyl.value.is_new ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
})

const listButtonClass = computed(() => {
  if (isInList.value) {
    return vinyl.value?.show_wishlist
      ? 'bg-red-500 text-white hover:bg-red-400'
      : 'bg-purple-500 text-white hover:bg-purple-400'
  }
  return 'bg-stone-700 text-white hover:bg-stone-600'
})

const listButtonText = computed(() => {
  if (!vinyl.value) return ''
  if (vinyl.value.show_wishlist) {
    return isInWishlist.value ? 'Na Wishlist' : 'Wishlist'
  }
  return isInWantlist.value ? 'Na Wantlist' : 'Avisar-me'
})

// Methods
const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  if (target.dataset.fallback === '1') return
  target.dataset.fallback = '1'
  target.src = PLACEHOLDER_IMG
}

const addToCart = async () => {
  if (!vinyl.value?.can_buy) return

  if (!authStore.isAuthenticated) {
    navigateTo('/login')
    return
  }

  if (isInCart.value) {
    const item = cartStore.items.find(i => i.vinyl_stock_id === vinyl.value!.id)
    if (item) await cartStore.removeItem(item.id)
  } else {
    await cartStore.addItem(vinyl.value.id)
  }
}

const toggleList = async () => {
  if (!vinyl.value) return

  if (!authStore.isAuthenticated) {
    navigateTo('/login')
    return
  }

  if (vinyl.value.show_wishlist) {
    await wishlistStore.toggle(vinyl.value.id)
  } else {
    await wantlistStore.toggle(vinyl.value.id)
  }
}

const openPlayer = () => {
  if (vinyl.value?.has_playable_tracks) {
    playerStore.loadVinyl({
      id: vinyl.value.id,
      title: vinyl.value.title,
      artist: vinyl.value.artist,
      cover_image: coverImage.value,
      tracks: vinyl.value.tracks || []
    })
    playerStore.play()
  }
}

const playTrack = (track: Track) => {
  if (vinyl.value && (track.has_audio || track.audio_url)) {
    playerStore.loadVinyl({
      id: vinyl.value.id,
      title: vinyl.value.title,
      artist: vinyl.value.artist,
      cover_image: coverImage.value,
      tracks: vinyl.value.tracks || []
    })
    playerStore.playTrack(track)
  }
}

// Comprar pelo WhatsApp (direto para a loja)
const buyOnWhatsApp = () => {
  if (!vinyl.value) return
  const whatsappNumber = siteSettingsStore.settings.whatsappNumber || '5511999999999'
  const text = `Olá! Tenho interesse no disco:\n\n🎵 *${vinyl.value.artist} - ${vinyl.value.title}*\n💰 ${formattedPrice.value}\n🔗 ${window.location.href}\n\nGostaria de mais informações para compra.`
  window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank')
}

// Compartilhar no WhatsApp
const shareOnWhatsApp = () => {
  if (!vinyl.value) return
  const text = `🎵 ${vinyl.value.artist} - ${vinyl.value.title}\n${formattedPrice.value}\n\n${window.location.href}`
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
}

// Compartilhar no Facebook
const shareOnFacebook = () => {
  if (!vinyl.value) return
  const url = encodeURIComponent(window.location.href)
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400')
}

// Compartilhar no Twitter/X
const shareOnTwitter = () => {
  if (!vinyl.value) return
  const text = encodeURIComponent(`🎵 ${vinyl.value.artist} - ${vinyl.value.title} ${formattedPrice.value}`)
  const url = encodeURIComponent(window.location.href)
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=600,height=400')
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    alert('Link copiado!')
  } catch (err) {
    console.error('Erro ao copiar:', err)
  }
}

// Watch for route changes
watch(() => route.params.slug, () => {
  if (route.params.slug) {
    fetchVinyl()
  }
})

onMounted(() => {
  fetchVinyl()
  siteSettingsStore.fetchSettings()
})

useHead({
  title: computed(() => vinyl.value
    ? `${vinyl.value.artist} - ${vinyl.value.title} | RDV Discos`
    : 'Disco - RDV Discos'),
  meta: [
    { name: 'description', content: computed(() => vinyl.value
      ? `${vinyl.value.artist} - ${vinyl.value.title}. ${vinyl.value.condition || ''} ${formattedPrice.value}`
      : 'Detalhes do disco de vinil.') }
  ]
})
</script>
