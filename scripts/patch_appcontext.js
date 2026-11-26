const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'src', 'context', 'AppContext.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Add imports
content = content.replace(
  "import { isSupabaseConfigured, supabase } from '../lib/supabase'",
  "import { isSupabaseConfigured, supabase } from '../lib/supabase'\nimport AsyncStorage from '@react-native-async-storage/async-storage'\nimport { pushMutation, startNetworkListener } from '../lib/sync'"
);

// 2. Add deleteAccount to Context Shape
content = content.replace(
  "updateSettings: (patch: Partial<UserSettings>) => Promise<void>\n}",
  "updateSettings: (patch: Partial<UserSettings>) => Promise<void>\n  deleteAccount: () => Promise<{ ok: boolean; message: string }>\n}"
);

// 3. Network Listener
content = content.replace(
  "const [authReady, setAuthReady] = useState(!isSupabaseConfigured)",
  "const [authReady, setAuthReady] = useState(!isSupabaseConfigured)\n  \n  useEffect(() => {\n    if (supabaseUser) {\n      const unsubscribe = startNetworkListener(supabaseUser.id)\n      return () => unsubscribe()\n    }\n  }, [supabaseUser])\n"
);

// 4. Offline Caching in loadAll
const oldLoadAll = `
    async function loadAll() {
      if (!supabase) return
      const [userRes, catRes, txRes] = await Promise.all([
        supabase.from('users').select('*').eq('id', uid).single(),
        supabase.from('categories').select('*').eq('user_id', uid).order('order', { ascending: true }),
        supabase.from('transactions').select('*').eq('user_id', uid).order('date', { ascending: false }),
      ])

      if (userRes.data) {
        setUserDoc({ createdAt: userRes.data.created_at, settings: userRes.data.settings as UserSettings })
      }

      if (catRes.data) {
        setCategories(catRes.data.map(rowToCategory))
      }

      if (txRes.data) {
        setTransactions(txRes.data.map(rowToTransaction))
      }

      setDataReady(true)
    }
`;

const newLoadAll = `
    async function loadAll() {
      if (!supabase) return
      
      try {
        const cachedUserDoc = await AsyncStorage.getItem(\`@cache_userDoc_\${uid}\`)
        const cachedCategories = await AsyncStorage.getItem(\`@cache_categories_\${uid}\`)
        const cachedTransactions = await AsyncStorage.getItem(\`@cache_transactions_\${uid}\`)
        
        if (cachedUserDoc) setUserDoc(JSON.parse(cachedUserDoc))
        if (cachedCategories) setCategories(JSON.parse(cachedCategories))
        if (cachedTransactions) setTransactions(JSON.parse(cachedTransactions))
        
        if (cachedUserDoc && cachedCategories && cachedTransactions) {
          setDataReady(true)
        }
      } catch (err) {}

      try {
        const [userRes, catRes, txRes] = await Promise.all([
          supabase.from('users').select('*').eq('id', uid).single(),
          supabase.from('categories').select('*').eq('user_id', uid).order('order', { ascending: true }),
          supabase.from('transactions').select('*').eq('user_id', uid).order('date', { ascending: false }),
        ])

        if (userRes.data) {
          const doc = { createdAt: userRes.data.created_at, settings: userRes.data.settings as UserSettings }
          setUserDoc(doc)
          void AsyncStorage.setItem(\`@cache_userDoc_\${uid}\`, JSON.stringify(doc))
        }

        if (catRes.data) {
          const cats = catRes.data.map(rowToCategory)
          setCategories(cats)
          void AsyncStorage.setItem(\`@cache_categories_\${uid}\`, JSON.stringify(cats))
        }

        if (txRes.data) {
          const txs = txRes.data.map(rowToTransaction)
          setTransactions(txs)
          void AsyncStorage.setItem(\`@cache_transactions_\${uid}\`, JSON.stringify(txs))
        }
      } catch (err) {
        console.warn('Network fetch failed, using cache', err)
      }

      setDataReady(true)
    }
`;

content = content.replace(oldLoadAll.trim(), newLoadAll.trim());

// 5. Update Mutations
// addTransaction
content = content.replace(
  `    async addTransaction(draft) {
      if (!currentAccount || !supabase) return
      const id = createId()
      await supabase.from('transactions').insert({
        id,
        user_id: currentAccount.id,
        amount: draft.amount,
        category_id: draft.categoryId,
        note: draft.note,
        date: draft.date,
        type: draft.type,
        payment_method: draft.paymentMethod,
        recurring: draft.recurring,
        updated_at: new Date().toISOString(),
      })
    },`,
  `    async addTransaction(draft) {
      if (!currentAccount || !supabase) return
      const id = createId()
      const newTx: Transaction = {
        id, amount: draft.amount, categoryId: draft.categoryId, note: draft.note,
        date: draft.date, type: draft.type, paymentMethod: draft.paymentMethod, recurring: draft.recurring
      }
      setTransactions(prev => {
        const next = [newTx, ...prev]
        void AsyncStorage.setItem(\`@cache_transactions_\${currentAccount.id}\`, JSON.stringify(next))
        return next
      })
      await pushMutation(currentAccount.id, 'transactions', 'insert', {
        id, user_id: currentAccount.id, amount: draft.amount, category_id: draft.categoryId, note: draft.note,
        date: draft.date, type: draft.type, payment_method: draft.paymentMethod, recurring: draft.recurring, updated_at: new Date().toISOString()
      })
    },`
);

// updateTransaction
content = content.replace(
  `    async updateTransaction(transactionId, draft) {
      if (!currentAccount || !supabase) return
      await supabase
        .from('transactions')
        .update({
          amount: draft.amount,
          category_id: draft.categoryId,
          note: draft.note,
          date: draft.date,
          type: draft.type,
          payment_method: draft.paymentMethod,
          recurring: draft.recurring,
          updated_at: new Date().toISOString(),
        })
        .eq('id', transactionId)
        .eq('user_id', currentAccount.id)
    },`,
  `    async updateTransaction(transactionId, draft) {
      if (!currentAccount || !supabase) return
      setTransactions(prev => {
        const next = prev.map(t => t.id === transactionId ? { ...t, amount: draft.amount, categoryId: draft.categoryId, note: draft.note, date: draft.date, type: draft.type, paymentMethod: draft.paymentMethod, recurring: draft.recurring } : t)
        void AsyncStorage.setItem(\`@cache_transactions_\${currentAccount.id}\`, JSON.stringify(next))
        return next
      })
      await pushMutation(currentAccount.id, 'transactions', 'update', {
        amount: draft.amount, category_id: draft.categoryId, note: draft.note, date: draft.date, type: draft.type, payment_method: draft.paymentMethod, recurring: draft.recurring, updated_at: new Date().toISOString()
      }, 'id', transactionId)
    },`
);

// deleteTransaction
content = content.replace(
  `    async deleteTransaction(transactionId) {
      if (!currentAccount || !supabase) return
      await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('user_id', currentAccount.id)
    },`,
  `    async deleteTransaction(transactionId) {
      if (!currentAccount || !supabase) return
      setTransactions(prev => {
        const next = prev.filter(t => t.id !== transactionId)
        void AsyncStorage.setItem(\`@cache_transactions_\${currentAccount.id}\`, JSON.stringify(next))
        return next
      })
      await pushMutation(currentAccount.id, 'transactions', 'delete', {}, 'id', transactionId)
    },`
);

// addCategory
content = content.replace(
  `    async addCategory(draft) {
      if (!currentAccount || !supabase) return
      const id = createId()
      await supabase.from('categories').insert({
        id,
        user_id: currentAccount.id,
        name: draft.name,
        icon: draft.icon,
        color: draft.color,
        type: draft.type,
        order: currentAccount.categories.length,
        updated_at: new Date().toISOString(),
      })
    },`,
  `    async addCategory(draft) {
      if (!currentAccount || !supabase) return
      const id = createId()
      const newCat: Category = { id, name: draft.name, icon: draft.icon, color: draft.color, type: draft.type, order: currentAccount.categories.length }
      setCategories(prev => {
        const next = [...prev, newCat]
        void AsyncStorage.setItem(\`@cache_categories_\${currentAccount.id}\`, JSON.stringify(next))
        return next
      })
      await pushMutation(currentAccount.id, 'categories', 'insert', {
        id, user_id: currentAccount.id, name: draft.name, icon: draft.icon, color: draft.color, type: draft.type, order: newCat.order, updated_at: new Date().toISOString()
      })
    },`
);

// updateCategory
content = content.replace(
  `    async updateCategory(categoryId, draft) {
      if (!currentAccount || !supabase) return
      await supabase
        .from('categories')
        .update({
          name: draft.name,
          icon: draft.icon,
          color: draft.color,
          type: draft.type,
          updated_at: new Date().toISOString(),
        })
        .eq('id', categoryId)
        .eq('user_id', currentAccount.id)
    },`,
  `    async updateCategory(categoryId, draft) {
      if (!currentAccount || !supabase) return
      setCategories(prev => {
        const next = prev.map(c => c.id === categoryId ? { ...c, name: draft.name, icon: draft.icon, color: draft.color, type: draft.type } : c)
        void AsyncStorage.setItem(\`@cache_categories_\${currentAccount.id}\`, JSON.stringify(next))
        return next
      })
      await pushMutation(currentAccount.id, 'categories', 'update', {
        name: draft.name, icon: draft.icon, color: draft.color, type: draft.type, updated_at: new Date().toISOString()
      }, 'id', categoryId)
    },`
);

// deleteCategory
content = content.replace(
  `      try {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', categoryId)
          .eq('user_id', currentAccount.id)
        if (error) throw error
        return { ok: true, message: 'Category deleted.' }
      } catch (error) {
        return { ok: false, message: 'Failed to delete category: ' + getErrorMessage(error, 'Unknown error') }
      }`,
  `      try {
        setCategories(prev => {
          const next = prev.filter(c => c.id !== categoryId)
          void AsyncStorage.setItem(\`@cache_categories_\${currentAccount.id}\`, JSON.stringify(next))
          return next
        })
        await pushMutation(currentAccount.id, 'categories', 'delete', {}, 'id', categoryId)
        return { ok: true, message: 'Category deleted.' }
      } catch (error) {
        return { ok: false, message: 'Failed to delete category: ' + getErrorMessage(error, 'Unknown error') }
      }`
);

// updateSettings
content = content.replace(
  `      const { error } = await supabase
        .from('users')
        .update({ settings: nextSettings, updated_at: new Date().toISOString() })
        .eq('id', currentAccount.id)

      if (error) {
        console.error('Supabase updateSettings error:', error)
        throw new Error(error.message)
      }`,
  `      if (userDoc) {
        const nextDoc = { ...userDoc, settings: nextSettings }
        setUserDoc(nextDoc)
        void AsyncStorage.setItem(\`@cache_userDoc_\${currentAccount.id}\`, JSON.stringify(nextDoc))
      }
      await pushMutation(currentAccount.id, 'users', 'update', {
        settings: nextSettings, updated_at: new Date().toISOString()
      }, 'id', currentAccount.id)`
);

// 6. Add deleteAccount method
content = content.replace(
  `  }), [currentAccount, isReady, supabaseUser])`,
  `
    async deleteAccount() {
      if (!supabase || !currentAccount) return { ok: false, message: 'Not ready' }
      try {
        const { error } = await supabase.rpc('delete_user')
        if (error) throw error
        await supabase.auth.signOut()
        return { ok: true, message: 'Account deleted' }
      } catch (err) {
        return { ok: false, message: getErrorMessage(err, 'Failed to delete account') }
      }
    }
  }), [currentAccount, isReady, supabaseUser])`
);

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Patch complete.');
