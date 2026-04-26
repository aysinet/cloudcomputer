(function (Vue) {
  const { ref, reactive, computed, onMounted, watch } = Vue;

  const LANGS = {
    en: {
      repos: 'Repos', git: 'Local Git', gists: 'Gists', settings: 'Settings',
      loading: 'Loading…', searchRepos: 'Search repositories…', all: 'All', owned: 'Owned', public: 'Public', private: 'Private', forks: 'Forks',
      newRepo: 'New Repo', noRepos: 'No repositories found.', clone: 'Clone', delete: 'Delete', back: 'Back',
      createRepo: 'Create Repository', repoName: 'Name', repoNamePlaceholder: 'my-project', description: 'Description', initReadme: 'Initialize with README', create: 'Create', cancel: 'Cancel',
      newBranch: 'New Branch', createBranch: 'Create Branch', branchName: 'Branch name', branchNamePlaceholder: 'feature/my-feature', from: 'From',
      open: 'Open', closed: 'Closed', newIssue: 'New Issue', createIssue: 'Create Issue', issueTitle: 'Title', issueBody: 'Body', noIssues: 'No issues.', noCommits: 'No commits.', noPRs: 'No pull requests.',
      closeIssue: 'Close Issue', reopenIssue: 'Reopen Issue', comment: 'Comment', addComment: 'Write a comment…',
      gists: 'Gists', newGist: 'New Gist', createGist: 'Create Gist', noGists: 'No gists.', files: 'files', fileContent: 'File content…', addFile: 'Add file',
      localGit: 'Local Git Repositories', initRepo: 'Init Repo', refresh: 'Refresh', noLocalRepos: 'No local repositories found.',
      status: 'Status', staged: 'Staged', modified: 'Modified', untracked: 'Untracked', workingClean: 'Working tree clean',
      commitMsg: 'Commit message…', commit: 'Commit', addAll: 'Add All', pull: 'Pull', push: 'Push', log: 'Log', remoteUrl: 'Remote URL', addRemote: 'Add Remote', output: 'Output',
      tokenRequired: 'GitHub Token Required', tokenRequiredDesc: 'Please configure your GitHub personal access token in settings.',
      goSettings: 'Go to Settings', githubToken: 'GitHub Token', tokenHelp: 'Personal access token with repo, gist scopes. Stored on server for your user only.',
      tokenPlaceholder: 'ghp_… or github_pat_…', show: 'Show', hide: 'Hide', createToken: 'Create token on GitHub →',
      defaultClonePath: 'Default Clone Path', clonePathHelp: 'Relative to your user files directory. Empty = root.', clonePathPlaceholder: 'e.g. projects',
      saving: 'Saving…', save: 'Save',
      cloneRepo: 'Clone Repository', repoUrl: 'Repository URL', targetPath: 'Target Path', initPathPlaceholder: 'e.g. my-project',
      init: 'Initialize', deleteConfirm: 'Are you sure you want to delete this repository?',
      code: 'Code', commits: 'Commits', branches: 'Branches', issues: 'Issues', pullRequests: 'Pull Requests'
    },
    tr: {
      repos: 'Depolar', git: 'Yerel Git', gists: 'Gist\'ler', settings: 'Ayarlar',
      loading: 'Yükleniyor…', searchRepos: 'Depo ara…', all: 'Tümü', owned: 'Sahip', public: 'Açık', private: 'Özel', forks: 'Fork',
      newRepo: 'Yeni Depo', noRepos: 'Depo bulunamadı.', clone: 'Klonla', delete: 'Sil', back: 'Geri',
      createRepo: 'Depo Oluştur', repoName: 'Ad', repoNamePlaceholder: 'projem', description: 'Açıklama', initReadme: 'README ile başlat', create: 'Oluştur', cancel: 'İptal',
      newBranch: 'Yeni Dal', createBranch: 'Dal Oluştur', branchName: 'Dal adı', branchNamePlaceholder: 'feature/ozellik', from: 'Kaynak',
      open: 'Açık', closed: 'Kapalı', newIssue: 'Yeni Konu', createIssue: 'Konu Oluştur', issueTitle: 'Başlık', issueBody: 'İçerik', noIssues: 'Konu yok.', noCommits: 'Commit yok.', noPRs: 'Pull request yok.',
      closeIssue: 'Konuyu Kapat', reopenIssue: 'Yeniden Aç', comment: 'Yorum', addComment: 'Yorum yazın…',
      gists: 'Gist\'ler', newGist: 'Yeni Gist', createGist: 'Gist Oluştur', noGists: 'Gist yok.', files: 'dosya', fileContent: 'Dosya içeriği…', addFile: 'Dosya ekle',
      localGit: 'Yerel Git Depoları', initRepo: 'Depo Başlat', refresh: 'Yenile', noLocalRepos: 'Yerel depo bulunamadı.',
      status: 'Durum', staged: 'Hazırlanmış', modified: 'Değiştirilmiş', untracked: 'Takip edilmeyen', workingClean: 'Çalışma dizini temiz',
      commitMsg: 'Commit mesajı…', commit: 'Commit', addAll: 'Tümünü Ekle', pull: 'Çek', push: 'Gönder', log: 'Günlük', remoteUrl: 'Uzak URL', addRemote: 'Uzak Ekle', output: 'Çıktı',
      tokenRequired: 'GitHub Token Gerekli', tokenRequiredDesc: 'Ayarlardan GitHub kişisel erişim tokenınızı yapılandırın.',
      goSettings: 'Ayarlara Git', githubToken: 'GitHub Token', tokenHelp: 'repo, gist kapsamlı kişisel erişim jetonu. Sunucuda sadece sizin kullanıcınız için saklanır.',
      tokenPlaceholder: 'ghp_… veya github_pat_…', show: 'Göster', hide: 'Gizle', createToken: 'GitHub\'da token oluştur →',
      defaultClonePath: 'Varsayılan Klonlama Yolu', clonePathHelp: 'Kullanıcı dosya dizininize göre. Boş = kök.', clonePathPlaceholder: 'örn. projeler',
      saving: 'Kaydediliyor…', save: 'Kaydet',
      cloneRepo: 'Depoyu Klonla', repoUrl: 'Depo URL\'si', targetPath: 'Hedef Yol', initPathPlaceholder: 'örn. projem',
      init: 'Başlat', deleteConfirm: 'Bu depoyu silmek istediğinizden emin misiniz?',
      code: 'Kod', commits: 'Commitler', branches: 'Dallar', issues: 'Konular', pullRequests: 'Pull Request\'ler'
    },
    de: {
      repos: 'Repos', git: 'Lokales Git', gists: 'Gists', settings: 'Einstellungen',
      loading: 'Laden…', searchRepos: 'Repos suchen…', all: 'Alle', owned: 'Eigene', public: 'Öffentlich', private: 'Privat', forks: 'Forks',
      newRepo: 'Neues Repo', noRepos: 'Keine Repos gefunden.', clone: 'Klonen', delete: 'Löschen', back: 'Zurück',
      createRepo: 'Repository erstellen', repoName: 'Name', repoNamePlaceholder: 'mein-projekt', description: 'Beschreibung', initReadme: 'Mit README initialisieren', create: 'Erstellen', cancel: 'Abbrechen',
      newBranch: 'Neuer Branch', createBranch: 'Branch erstellen', branchName: 'Branch-Name', branchNamePlaceholder: 'feature/mein-feature', from: 'Von',
      open: 'Offen', closed: 'Geschlossen', newIssue: 'Neues Issue', createIssue: 'Issue erstellen', issueTitle: 'Titel', issueBody: 'Inhalt', noIssues: 'Keine Issues.', noCommits: 'Keine Commits.', noPRs: 'Keine Pull Requests.',
      closeIssue: 'Issue schließen', reopenIssue: 'Wiedereröffnen', comment: 'Kommentar', addComment: 'Kommentar schreiben…',
      gists: 'Gists', newGist: 'Neues Gist', createGist: 'Gist erstellen', noGists: 'Keine Gists.', files: 'Dateien', fileContent: 'Dateiinhalt…', addFile: 'Datei hinzufügen',
      localGit: 'Lokale Git-Repositories', initRepo: 'Repo initialisieren', refresh: 'Aktualisieren', noLocalRepos: 'Keine lokalen Repos gefunden.',
      status: 'Status', staged: 'Bereitgestellt', modified: 'Geändert', untracked: 'Unverfolgt', workingClean: 'Arbeitsverzeichnis sauber',
      commitMsg: 'Commit-Nachricht…', commit: 'Commit', addAll: 'Alle hinzufügen', pull: 'Pull', push: 'Push', log: 'Log', remoteUrl: 'Remote-URL', addRemote: 'Remote hinzufügen', output: 'Ausgabe',
      tokenRequired: 'GitHub-Token erforderlich', tokenRequiredDesc: 'Bitte konfigurieren Sie Ihr GitHub-Token in den Einstellungen.',
      goSettings: 'Zu Einstellungen', githubToken: 'GitHub-Token', tokenHelp: 'Persönliches Zugriffstoken mit repo, gist Berechtigung.',
      tokenPlaceholder: 'ghp_… oder github_pat_…', show: 'Zeigen', hide: 'Verbergen', createToken: 'Token auf GitHub erstellen →',
      defaultClonePath: 'Standard-Klonpfad', clonePathHelp: 'Relativ zu Ihrem Benutzerdateiverzeichnis.', clonePathPlaceholder: 'z.B. projekte',
      saving: 'Speichern…', save: 'Speichern',
      cloneRepo: 'Repository klonen', repoUrl: 'Repository-URL', targetPath: 'Zielpfad', initPathPlaceholder: 'z.B. mein-projekt',
      init: 'Initialisieren', deleteConfirm: 'Möchten Sie dieses Repository wirklich löschen?',
      code: 'Code', commits: 'Commits', branches: 'Branches', issues: 'Issues', pullRequests: 'Pull Requests'
    },
    fr: {
      repos: 'Dépôts', git: 'Git Local', gists: 'Gists', settings: 'Paramètres',
      loading: 'Chargement…', searchRepos: 'Rechercher…', all: 'Tous', owned: 'Possédés', public: 'Public', private: 'Privé', forks: 'Forks',
      newRepo: 'Nouveau dépôt', noRepos: 'Aucun dépôt trouvé.', clone: 'Cloner', delete: 'Supprimer', back: 'Retour',
      createRepo: 'Créer un dépôt', repoName: 'Nom', repoNamePlaceholder: 'mon-projet', description: 'Description', initReadme: 'Initialiser avec README', create: 'Créer', cancel: 'Annuler',
      newBranch: 'Nouvelle branche', createBranch: 'Créer une branche', branchName: 'Nom de branche', branchNamePlaceholder: 'feature/ma-feature', from: 'Depuis',
      open: 'Ouvert', closed: 'Fermé', newIssue: 'Nouveau ticket', createIssue: 'Créer un ticket', issueTitle: 'Titre', issueBody: 'Contenu', noIssues: 'Aucun ticket.', noCommits: 'Aucun commit.', noPRs: 'Aucune pull request.',
      closeIssue: 'Fermer le ticket', reopenIssue: 'Rouvrir', comment: 'Commenter', addComment: 'Écrire un commentaire…',
      gists: 'Gists', newGist: 'Nouveau Gist', createGist: 'Créer un Gist', noGists: 'Aucun gist.', files: 'fichiers', fileContent: 'Contenu du fichier…', addFile: 'Ajouter un fichier',
      localGit: 'Dépôts Git locaux', initRepo: 'Initialiser', refresh: 'Actualiser', noLocalRepos: 'Aucun dépôt local trouvé.',
      status: 'Statut', staged: 'Indexé', modified: 'Modifié', untracked: 'Non suivi', workingClean: 'Répertoire de travail propre',
      commitMsg: 'Message de commit…', commit: 'Commit', addAll: 'Tout ajouter', pull: 'Tirer', push: 'Pousser', log: 'Journal', remoteUrl: 'URL distante', addRemote: 'Ajouter distant', output: 'Sortie',
      tokenRequired: 'Token GitHub requis', tokenRequiredDesc: 'Veuillez configurer votre token dans les paramètres.',
      goSettings: 'Paramètres', githubToken: 'Token GitHub', tokenHelp: 'Token d\'accès personnel avec les portées repo, gist.',
      tokenPlaceholder: 'ghp_… ou github_pat_…', show: 'Afficher', hide: 'Masquer', createToken: 'Créer un token sur GitHub →',
      defaultClonePath: 'Chemin de clonage par défaut', clonePathHelp: 'Relatif à votre dossier de fichiers.', clonePathPlaceholder: 'ex. projets',
      saving: 'Enregistrement…', save: 'Enregistrer',
      cloneRepo: 'Cloner le dépôt', repoUrl: 'URL du dépôt', targetPath: 'Chemin cible', initPathPlaceholder: 'ex. mon-projet',
      init: 'Initialiser', deleteConfirm: 'Voulez-vous vraiment supprimer ce dépôt?',
      code: 'Code', commits: 'Commits', branches: 'Branches', issues: 'Tickets', pullRequests: 'Pull Requests'
    },
    es: {
      repos: 'Repos', git: 'Git Local', gists: 'Gists', settings: 'Ajustes',
      loading: 'Cargando…', searchRepos: 'Buscar repos…', all: 'Todos', owned: 'Propios', public: 'Público', private: 'Privado', forks: 'Forks',
      newRepo: 'Nuevo Repo', noRepos: 'No se encontraron repos.', clone: 'Clonar', delete: 'Eliminar', back: 'Volver',
      createRepo: 'Crear Repositorio', repoName: 'Nombre', repoNamePlaceholder: 'mi-proyecto', description: 'Descripción', initReadme: 'Inicializar con README', create: 'Crear', cancel: 'Cancelar',
      newBranch: 'Nueva rama', createBranch: 'Crear rama', branchName: 'Nombre de rama', branchNamePlaceholder: 'feature/mi-feature', from: 'Desde',
      open: 'Abierto', closed: 'Cerrado', newIssue: 'Nuevo Issue', createIssue: 'Crear Issue', issueTitle: 'Título', issueBody: 'Contenido', noIssues: 'Sin issues.', noCommits: 'Sin commits.', noPRs: 'Sin pull requests.',
      closeIssue: 'Cerrar Issue', reopenIssue: 'Reabrir', comment: 'Comentar', addComment: 'Escribir comentario…',
      gists: 'Gists', newGist: 'Nuevo Gist', createGist: 'Crear Gist', noGists: 'Sin gists.', files: 'archivos', fileContent: 'Contenido del archivo…', addFile: 'Añadir archivo',
      localGit: 'Repos Git Locales', initRepo: 'Iniciar Repo', refresh: 'Actualizar', noLocalRepos: 'No se encontraron repos locales.',
      status: 'Estado', staged: 'Preparado', modified: 'Modificado', untracked: 'Sin seguimiento', workingClean: 'Directorio limpio',
      commitMsg: 'Mensaje de commit…', commit: 'Commit', addAll: 'Añadir todo', pull: 'Pull', push: 'Push', log: 'Log', remoteUrl: 'URL remota', addRemote: 'Añadir remoto', output: 'Salida',
      tokenRequired: 'Token de GitHub requerido', tokenRequiredDesc: 'Configure su token en los ajustes.',
      goSettings: 'Ir a Ajustes', githubToken: 'Token de GitHub', tokenHelp: 'Token de acceso personal con alcance repo, gist.',
      tokenPlaceholder: 'ghp_… o github_pat_…', show: 'Mostrar', hide: 'Ocultar', createToken: 'Crear token en GitHub →',
      defaultClonePath: 'Ruta de clonación por defecto', clonePathHelp: 'Relativa a su carpeta de archivos.', clonePathPlaceholder: 'ej. proyectos',
      saving: 'Guardando…', save: 'Guardar',
      cloneRepo: 'Clonar Repositorio', repoUrl: 'URL del repo', targetPath: 'Ruta destino', initPathPlaceholder: 'ej. mi-proyecto',
      init: 'Inicializar', deleteConfirm: '¿Seguro que desea eliminar este repositorio?',
      code: 'Código', commits: 'Commits', branches: 'Ramas', issues: 'Issues', pullRequests: 'Pull Requests'
    },
    ru: {
      repos: 'Репозитории', git: 'Локальный Git', gists: 'Gists', settings: 'Настройки',
      loading: 'Загрузка…', searchRepos: 'Поиск…', all: 'Все', owned: 'Свои', public: 'Публичный', private: 'Приватный', forks: 'Форки',
      newRepo: 'Новый репо', noRepos: 'Репозиториев нет.', clone: 'Клонировать', delete: 'Удалить', back: 'Назад',
      createRepo: 'Создать репозиторий', repoName: 'Имя', repoNamePlaceholder: 'мой-проект', description: 'Описание', initReadme: 'Инициализировать с README', create: 'Создать', cancel: 'Отмена',
      newBranch: 'Новая ветка', createBranch: 'Создать ветку', branchName: 'Имя ветки', branchNamePlaceholder: 'feature/моя-фича', from: 'Из',
      open: 'Открытые', closed: 'Закрытые', newIssue: 'Новый Issue', createIssue: 'Создать Issue', issueTitle: 'Заголовок', issueBody: 'Содержание', noIssues: 'Нет issues.', noCommits: 'Нет коммитов.', noPRs: 'Нет pull requests.',
      closeIssue: 'Закрыть Issue', reopenIssue: 'Переоткрыть', comment: 'Комментарий', addComment: 'Написать комментарий…',
      gists: 'Gists', newGist: 'Новый Gist', createGist: 'Создать Gist', noGists: 'Нет gists.', files: 'файлов', fileContent: 'Содержимое файла…', addFile: 'Добавить файл',
      localGit: 'Локальные Git репозитории', initRepo: 'Инициализация', refresh: 'Обновить', noLocalRepos: 'Нет локальных репозиториев.',
      status: 'Статус', staged: 'Подготовлено', modified: 'Изменено', untracked: 'Не отслеживается', workingClean: 'Рабочее дерево чисто',
      commitMsg: 'Сообщение коммита…', commit: 'Коммит', addAll: 'Добавить все', pull: 'Pull', push: 'Push', log: 'Журнал', remoteUrl: 'URL удалённого', addRemote: 'Добавить удалённый', output: 'Вывод',
      tokenRequired: 'Требуется GitHub токен', tokenRequiredDesc: 'Настройте токен в настройках.',
      goSettings: 'В настройки', githubToken: 'GitHub Токен', tokenHelp: 'Персональный токен доступа с правами repo, gist.',
      tokenPlaceholder: 'ghp_… или github_pat_…', show: 'Показать', hide: 'Скрыть', createToken: 'Создать токен на GitHub →',
      defaultClonePath: 'Путь клонирования по умолчанию', clonePathHelp: 'Относительно папки с файлами.', clonePathPlaceholder: 'напр. проекты',
      saving: 'Сохранение…', save: 'Сохранить',
      cloneRepo: 'Клонировать репозиторий', repoUrl: 'URL репозитория', targetPath: 'Целевой путь', initPathPlaceholder: 'напр. мой-проект',
      init: 'Инициализировать', deleteConfirm: 'Вы уверены, что хотите удалить этот репозиторий?',
      code: 'Код', commits: 'Коммиты', branches: 'Ветки', issues: 'Issues', pullRequests: 'Pull Requests'
    }
  };

  return {
    setup(props, { expose }) {
      const appEl = document.getElementById('app');
      const lang = ref((appEl?.__vue_app__?._instance?.exposed?.lang?.value) || localStorage.getItem('ui_lang') || 'en');
      const L = computed(() => LANGS[lang.value] || LANGS.en);

      function getToken() { return localStorage.getItem('auth_token') || localStorage.getItem('token') || ''; }
      function authHeaders() { return { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' }; }
      const ElMessage = (window.ElementPlus && window.ElementPlus.ElMessage) || { success: console.log, error: console.error, warning: console.warn, info: console.log };
      const ElMessageBox = (window.ElementPlus && window.ElementPlus.ElMessageBox) || { confirm: () => Promise.resolve() };
      function showErr(msg) { ElMessage.error({ message: msg, duration: 4000 }); }
      function showOk(msg) { ElMessage.success({ message: msg, duration: 2500 }); }

      // State
      const tab = ref('repos');
      const busy = ref(false);
      const busyMsg = ref('');
      const token = ref('');
      const ghUser = ref(null);

      // Repos
      const repos = ref([]);
      const repoSearch = ref('');
      const repoFilter = ref('all');

      // Repo detail
      const currentRepo = ref(null);
      const detailTab = ref('code');
      const currentBranch = ref('');
      const branches = ref([]);
      const repoContents = ref([]);
      const currentPath = ref('');
      const viewingFile = ref(null);
      const viewingFileContent = ref('');
      const commits = ref([]);
      const issues = ref([]);
      const issueState = ref('open');
      const pullRequests = ref([]);
      const prState = ref('open');

      // Issue detail
      const currentIssue = ref(null);
      const issueComments = ref([]);
      const newComment = ref('');

      // Gists
      const gists = ref([]);
      const currentGist = ref(null);

      // Local Git
      const localRepos = ref([]);
      const selectedLocalRepo = ref(null);
      const gitStatusResult = ref(null);
      const commitMsg = ref('');
      const gitLogResult = ref([]);
      const gitOutput = ref('');
      const remoteName = ref('origin');
      const remoteUrl = ref('');

      // Dialogs
      const showCreateRepo = ref(false);
      const newRepo = reactive({ name: '', description: '', private: false, auto_init: true });
      const showCreateBranch = ref(false);
      const newBranchName = ref('');
      const newBranchFrom = ref('');
      const showCreateIssue = ref(false);
      const newIssue = reactive({ title: '', body: '' });
      const showCreateGist = ref(false);
      const newGist = reactive({ description: '', public: true, files: [{ name: '', content: '' }] });
      const showCloneDialog = ref(false);
      const cloneUrl = ref('');
      const clonePath = ref('');
      const showInitRepo = ref(false);
      const initPath = ref('');

      // Settings
      const settingsToken = ref('');
      const settingsClonePath = ref('');
      const showToken = ref(false);
      const savingSettings = ref(false);

      const tabs = computed(() => [
        { key: 'repos', icon: '📂', label: L.value.repos },
        { key: 'git', icon: '🔀', label: L.value.git },
        { key: 'gists', icon: '📋', label: L.value.gists }
      ]);

      const detailTabs = computed(() => [
        { key: 'code', icon: '📄', label: L.value.code },
        { key: 'commits', icon: '📝', label: L.value.commits, load: loadCommits },
        { key: 'branches', icon: '🌿', label: L.value.branches, load: loadBranches },
        { key: 'issues', icon: '🐛', label: L.value.issues, load: loadIssues },
        { key: 'pulls', icon: '🔀', label: L.value.pullRequests, load: loadPullRequests }
      ]);

      const pathParts = computed(() => currentPath.value ? currentPath.value.split('/') : []);

      const filteredRepos = computed(() => {
        let list = repos.value;
        if (repoSearch.value) {
          const q = repoSearch.value.toLowerCase();
          list = list.filter(r => r.full_name.toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q));
        }
        switch (repoFilter.value) {
          case 'owner': return list.filter(r => !r.fork);
          case 'public': return list.filter(r => !r.private);
          case 'private': return list.filter(r => r.private);
          case 'forks': return list.filter(r => r.fork);
          default: return list;
        }
      });

      // ── GitHub API Helpers (via backend proxy) ──
      async function ghApi(endpoint, opts = {}) {
        const r = await fetch('/api/github' + endpoint, {
          method: opts.method || 'GET',
          headers: authHeaders(),
          body: opts.body ? JSON.stringify(opts.body) : undefined
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || data.message || 'API error');
        return data;
      }

      async function gitApi(endpoint, opts = {}) {
        const method = opts.method || 'POST';
        const fetchOpts = { method, headers: authHeaders() };
        if (opts.body && method !== 'GET') fetchOpts.body = JSON.stringify(opts.body);
        const r = await fetch('/api/git' + endpoint, fetchOpts);
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || data.message || 'Git error');
        return data;
      }

      // ── Load settings ──
      async function loadSettings() {
        try {
          const data = await ghApi('/settings');
          token.value = data.token || '';
          settingsToken.value = data.token || '';
          settingsClonePath.value = data.clonePath || '';
        } catch { /* no settings yet */ }
      }

      async function saveSettings() {
        savingSettings.value = true;
        try {
          await ghApi('/settings', { method: 'POST', body: { token: settingsToken.value, clonePath: settingsClonePath.value } });
          token.value = settingsToken.value;
          if (token.value) {
            await loadGhUser();
            await loadRepos();
            tab.value = 'repos';
          }
        } catch (e) {
          showErr(e.message);
        }
        savingSettings.value = false;
      }

      // ── GitHub User ──
      async function loadGhUser() {
        if (!token.value) return;
        try { ghUser.value = await ghApi('/user'); } catch { ghUser.value = null; }
      }

      // ── Repos ──
      async function loadRepos() {
        if (!token.value) return;
        busy.value = true;
        try { repos.value = await ghApi('/repos'); } catch (e) { repos.value = []; }
        busy.value = false;
      }

      async function createRepo() {
        busy.value = true;
        try {
          await ghApi('/repos', { method: 'POST', body: { name: newRepo.name, description: newRepo.description, private: newRepo.private, auto_init: newRepo.auto_init } });
          showCreateRepo.value = false;
          newRepo.name = ''; newRepo.description = '';
          loadRepos();
        } catch (e) { showErr(e.message); }
        busy.value = false;
      }

      async function deleteRemoteRepo(r) {
        try { await ElMessageBox.confirm(L.value.deleteConfirm, { confirmButtonText: 'OK', cancelButtonText: 'Cancel', type: 'warning' }); } catch { return; }
        busy.value = true;
        try {
          await ghApi('/repos/' + r.full_name, { method: 'DELETE' });
          loadRepos();
        } catch (e) { showErr(e.message); }
        busy.value = false;
      }

      async function openRepo(r) {
        currentRepo.value = r;
        currentBranch.value = r.default_branch || 'main';
        detailTab.value = 'code';
        tab.value = 'repoDetail';
        await loadBranches();
        loadRepoContents('');
      }

      // ── Branches ──
      async function loadBranches() {
        if (!currentRepo.value) return;
        try { branches.value = await ghApi('/repos/' + currentRepo.value.full_name + '/branches'); } catch { branches.value = []; }
      }

      async function createBranch() {
        busy.value = true;
        try {
          await ghApi('/repos/' + currentRepo.value.full_name + '/branches', { method: 'POST', body: { name: newBranchName.value, from: newBranchFrom.value || currentBranch.value } });
          showCreateBranch.value = false;
          newBranchName.value = '';
          loadBranches();
        } catch (e) { showErr(e.message); }
        busy.value = false;
      }

      async function deleteBranch(b) {
        try { await ElMessageBox.confirm(`Delete branch "${b.name}"?`, { confirmButtonText: 'OK', cancelButtonText: 'Cancel', type: 'warning' }); } catch { return; }
        try {
          await ghApi('/repos/' + currentRepo.value.full_name + '/branches/' + b.name, { method: 'DELETE' });
          loadBranches();
        } catch (e) { showErr(e.message); }
      }

      // ── Repo Contents ──
      async function loadRepoContents(p) {
        currentPath.value = p;
        viewingFile.value = null;
        try {
          repoContents.value = await ghApi('/repos/' + currentRepo.value.full_name + '/contents?path=' + encodeURIComponent(p) + '&ref=' + encodeURIComponent(currentBranch.value));
          repoContents.value.sort((a, b) => (a.type === 'dir' ? -1 : 1) - (b.type === 'dir' ? -1 : 1) || a.name.localeCompare(b.name));
        } catch { repoContents.value = []; }
      }

      function goUp() {
        const parts = currentPath.value.split('/');
        parts.pop();
        loadRepoContents(parts.join('/'));
      }

      async function viewFile(f) {
        try {
          const data = await ghApi('/repos/' + currentRepo.value.full_name + '/contents/' + encodeURIComponent(f.path) + '?ref=' + encodeURIComponent(currentBranch.value));
          viewingFile.value = f;
          viewingFileContent.value = data.content || '(binary or empty)';
        } catch (e) { showErr(e.message); }
      }

      async function downloadFile(f) {
        try {
          const data = await ghApi('/repos/' + currentRepo.value.full_name + '/contents/' + encodeURIComponent(f.path) + '?ref=' + encodeURIComponent(currentBranch.value));
          if (data.download_url) window.open(data.download_url, '_blank');
        } catch (e) { showErr(e.message); }
      }

      // ── Commits ──
      async function loadCommits() {
        if (!currentRepo.value) return;
        try { commits.value = await ghApi('/repos/' + currentRepo.value.full_name + '/commits?sha=' + encodeURIComponent(currentBranch.value)); } catch { commits.value = []; }
      }

      // ── Issues ──
      async function loadIssues() {
        if (!currentRepo.value) return;
        try { issues.value = await ghApi('/repos/' + currentRepo.value.full_name + '/issues?state=' + issueState.value); } catch { issues.value = []; }
      }

      async function createIssue() {
        busy.value = true;
        try {
          await ghApi('/repos/' + currentRepo.value.full_name + '/issues', { method: 'POST', body: { title: newIssue.title, body: newIssue.body } });
          showCreateIssue.value = false;
          newIssue.title = ''; newIssue.body = '';
          loadIssues();
        } catch (e) { showErr(e.message); }
        busy.value = false;
      }

      async function viewIssue(issue) {
        currentIssue.value = issue;
        newComment.value = '';
        try { issueComments.value = await ghApi('/repos/' + currentRepo.value.full_name + '/issues/' + issue.number + '/comments'); } catch { issueComments.value = []; }
      }

      async function addIssueComment() {
        try {
          await ghApi('/repos/' + currentRepo.value.full_name + '/issues/' + currentIssue.value.number + '/comments', { method: 'POST', body: { body: newComment.value } });
          newComment.value = '';
          const coms = await ghApi('/repos/' + currentRepo.value.full_name + '/issues/' + currentIssue.value.number + '/comments');
          issueComments.value = coms;
        } catch (e) { showErr(e.message); }
      }

      async function toggleIssueState() {
        const newState = currentIssue.value.state === 'open' ? 'closed' : 'open';
        try {
          const updated = await ghApi('/repos/' + currentRepo.value.full_name + '/issues/' + currentIssue.value.number, { method: 'PATCH', body: { state: newState } });
          currentIssue.value = updated;
          loadIssues();
        } catch (e) { showErr(e.message); }
      }

      // ── Pull Requests ──
      async function loadPullRequests() {
        if (!currentRepo.value) return;
        try { pullRequests.value = await ghApi('/repos/' + currentRepo.value.full_name + '/pulls?state=' + prState.value); } catch { pullRequests.value = []; }
      }

      // ── Gists ──
      async function loadGists() {
        if (!token.value) return;
        try { gists.value = await ghApi('/gists'); } catch { gists.value = []; }
      }

      async function viewGist(g) {
        try { currentGist.value = await ghApi('/gists/' + g.id); } catch (e) { showErr(e.message); }
      }

      async function createGist() {
        const files = {};
        for (const f of newGist.files) {
          if (f.name) files[f.name] = { content: f.content || ' ' };
        }
        if (!Object.keys(files).length) return;
        busy.value = true;
        try {
          await ghApi('/gists', { method: 'POST', body: { description: newGist.description, public: newGist.public, files } });
          showCreateGist.value = false;
          newGist.description = ''; newGist.public = true; newGist.files = [{ name: '', content: '' }];
          loadGists();
        } catch (e) { showErr(e.message); }
        busy.value = false;
      }

      async function deleteGist(g) {
        try { await ElMessageBox.confirm(L.value.deleteConfirm, { confirmButtonText: 'OK', cancelButtonText: 'Cancel', type: 'warning' }); } catch { return; }
        try { await ghApi('/gists/' + g.id, { method: 'DELETE' }); loadGists(); } catch (e) { showErr(e.message); }
      }

      // ── Local Git Operations ──
      async function loadLocalRepos() {
        try {
          const data = await gitApi('/repos', { method: 'GET' });
          localRepos.value = data;
        } catch { localRepos.value = []; }
      }

      async function selectLocalRepo(lr) {
        selectedLocalRepo.value = lr;
        gitStatusResult.value = null;
        gitLogResult.value = [];
        gitOutput.value = '';
        gitStatus();
      }

      async function gitStatus() {
        if (!selectedLocalRepo.value) return;
        try {
          gitStatusResult.value = await gitApi('/status', { body: { repoPath: selectedLocalRepo.value.path } });
        } catch (e) { gitOutput.value = e.message; }
      }

      async function gitAddAll() {
        if (!selectedLocalRepo.value) return;
        try {
          const r = await gitApi('/add', { body: { repoPath: selectedLocalRepo.value.path, files: ['.'] } });
          gitOutput.value = r.output || 'All files staged.';
          gitStatus();
        } catch (e) { gitOutput.value = e.message; }
      }

      async function gitCommit() {
        if (!selectedLocalRepo.value || !commitMsg.value.trim()) return;
        try {
          const r = await gitApi('/commit', { body: { repoPath: selectedLocalRepo.value.path, message: commitMsg.value } });
          gitOutput.value = r.output || 'Committed.';
          commitMsg.value = '';
          gitStatus();
        } catch (e) { gitOutput.value = e.message; }
      }

      async function gitPull() {
        if (!selectedLocalRepo.value) return;
        busy.value = true; busyMsg.value = 'Pulling…';
        try {
          const r = await gitApi('/pull', { body: { repoPath: selectedLocalRepo.value.path } });
          gitOutput.value = r.output || 'Pulled.';
          gitStatus();
        } catch (e) { gitOutput.value = e.message; }
        busy.value = false; busyMsg.value = '';
      }

      async function gitPush() {
        if (!selectedLocalRepo.value) return;
        busy.value = true; busyMsg.value = 'Pushing…';
        try {
          const r = await gitApi('/push', { body: { repoPath: selectedLocalRepo.value.path } });
          gitOutput.value = r.output || 'Pushed.';
        } catch (e) { gitOutput.value = e.message; }
        busy.value = false; busyMsg.value = '';
      }

      async function gitLog() {
        if (!selectedLocalRepo.value) return;
        try {
          gitLogResult.value = await gitApi('/log', { body: { repoPath: selectedLocalRepo.value.path } });
        } catch (e) { gitOutput.value = e.message; }
      }

      async function gitRemoteAdd() {
        if (!selectedLocalRepo.value || !remoteUrl.value.trim()) return;
        try {
          const r = await gitApi('/remote-add', { body: { repoPath: selectedLocalRepo.value.path, name: remoteName.value || 'origin', url: remoteUrl.value } });
          gitOutput.value = r.output || 'Remote added.';
        } catch (e) { gitOutput.value = e.message; }
      }

      async function doClone() {
        if (!cloneUrl.value.trim()) return;
        busy.value = true; busyMsg.value = 'Cloning…';
        try {
          const r = await gitApi('/clone', { body: { url: cloneUrl.value, path: clonePath.value || '' } });
          gitOutput.value = r.output || 'Cloned successfully.';
          showCloneDialog.value = false;
          cloneUrl.value = ''; clonePath.value = '';
          loadLocalRepos();
        } catch (e) { gitOutput.value = e.message; }
        busy.value = false; busyMsg.value = '';
      }

      async function doInit() {
        if (!initPath.value.trim()) return;
        busy.value = true;
        try {
          const r = await gitApi('/init', { body: { path: initPath.value } });
          gitOutput.value = r.output || 'Initialized.';
          showInitRepo.value = false;
          initPath.value = '';
          loadLocalRepos();
        } catch (e) { gitOutput.value = e.message; }
        busy.value = false;
      }

      async function cloneRepo(r) {
        cloneUrl.value = r.clone_url || ('https://github.com/' + r.full_name + '.git');
        clonePath.value = settingsClonePath.value ? settingsClonePath.value + '/' + r.name : r.name;
        showCloneDialog.value = true;
      }

      // ── Helpers ──
      function formatDate(d) {
        if (!d) return '';
        const dt = new Date(d);
        return dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      function formatSize(bytes) {
        if (!bytes) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
      }

      function fileIcon(name) {
        const ext = (name || '').split('.').pop().toLowerCase();
        const map = { js: '📜', ts: '📘', py: '🐍', java: '☕', go: '🔵', rs: '🦀', c: '⚙️', cpp: '⚙️', h: '⚙️', html: '🌐', css: '🎨', json: '{}', md: '📝', txt: '📄', yml: '⚙️', yaml: '⚙️', xml: '📋', sh: '🐚', bat: '🖥️', ps1: '🖥️', sql: '🗃️', svg: '🖼️', png: '🖼️', jpg: '🖼️', gif: '🖼️', pdf: '📕' };
        return map[ext] || '📄';
      }

      function getGistTitle(g) {
        if (!g || !g.files) return 'Gist';
        const names = Object.keys(g.files);
        return names[0] || 'Gist';
      }

      function renderMarkdown(text) {
        if (!text) return '';
        // Basic markdown → HTML (safe subset)
        return text
          .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>')
          .replace(/`([^`]+)`/g, '<code>$1</code>')
          .replace(/\n/g, '<br>');
      }

      // ── Watch tab changes ──
      watch(tab, (v) => {
        if (v === 'repos' && repos.value.length === 0 && token.value) loadRepos();
        if (v === 'gists' && gists.value.length === 0 && token.value) loadGists();
        if (v === 'git') loadLocalRepos();
      });

      // ── Init ──
      onMounted(async () => {
        await loadSettings();
        if (token.value) {
          loadGhUser();
          loadRepos();
        }
        loadLocalRepos();
      });

      return {
        L, tab, tabs, busy, busyMsg, token, ghUser,
        repos, repoSearch, repoFilter, filteredRepos,
        currentRepo, detailTab, detailTabs, currentBranch,
        branches, repoContents, currentPath, pathParts, viewingFile, viewingFileContent,
        commits, issues, issueState, pullRequests, prState,
        currentIssue, issueComments, newComment,
        gists, currentGist,
        localRepos, selectedLocalRepo, gitStatusResult, commitMsg, gitLogResult, gitOutput, remoteName, remoteUrl,
        showCreateRepo, newRepo, showCreateBranch, newBranchName, newBranchFrom,
        showCreateIssue, newIssue, showCreateGist, newGist,
        showCloneDialog, cloneUrl, clonePath, showInitRepo, initPath,
        settingsToken, settingsClonePath, showToken, savingSettings,
        loadRepos, createRepo, deleteRemoteRepo, openRepo,
        loadBranches, createBranch, deleteBranch,
        loadRepoContents, goUp, viewFile, downloadFile,
        loadCommits, loadIssues, createIssue, viewIssue, addIssueComment, toggleIssueState,
        loadPullRequests, loadGists, viewGist, createGist, deleteGist,
        loadLocalRepos, selectLocalRepo, gitStatus, gitAddAll, gitCommit, gitPull, gitPush, gitLog, gitRemoteAdd,
        doClone, doInit, cloneRepo, saveSettings,
        formatDate, formatSize, fileIcon, getGistTitle, renderMarkdown
      };
    }
  };
})(Vue);
