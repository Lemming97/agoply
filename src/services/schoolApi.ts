export type School = {
  uai: string
  name: string
  city: string
  department: string
  departmentCode: string
  type: string
}

const BASE = 'https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-annuaire-education/records'

export async function searchLycees(query: string): Promise<School[]> {
  if (query.trim().length < 2) return []

  const q = query.trim()
  const params = new URLSearchParams({
    where: `type_etablissement LIKE "Lycée%" AND (nom_etablissement LIKE "%${q}%" OR nom_commune LIKE "%${q}%")`,
    limit: '20',
    select: 'nom_etablissement,identifiant_de_l_etablissement,nom_commune,libelle_departement,code_departement,type_etablissement',
  })

  try {
    const res = await fetch(`${BASE}?${params}`)
    if (!res.ok) return []
    const data = await res.json() as { results?: Record<string, string>[] }
    return (data.results ?? []).map(r => ({
      uai:            r.identifiant_de_l_etablissement ?? '',
      name:           r.nom_etablissement ?? '',
      city:           r.nom_commune ?? '',
      department:     r.libelle_departement ?? '',
      departmentCode: r.code_departement ?? '',
      type:           r.type_etablissement ?? '',
    }))
  } catch {
    return []
  }
}
