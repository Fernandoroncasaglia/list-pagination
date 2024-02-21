import { Plus, Search, FileDown, MoreHorizontal, Filter } from "lucide-react" //icones
import { Header } from "./compoonents/header"
import { Tabs } from "./compoonents/tabs"
import { Input } from "./compoonents/ui/input"
import { Control } from "./compoonents/ui/input"
import { Button } from "./compoonents/ui/button"
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "./compoonents/ui/table"
import { keepPreviousData, useQuery } from "@tanstack/react-query" // consumir rotas
import { Pagination } from "./compoonents/pagination"
import { useSearchParams } from "react-router-dom"
import { useState } from "react"
import useDebounceValue from "./hooks/use-debounce-value"

export interface TagResponse {
  first: number
  prev: number | null
  next: number
  last: number
  pages: number
  items: number
  data: Tag[]
}

export interface Tag {
  title: string
  "Amount of videos": number
  id: string
}

function App() {

  const [searchParams, setSearchParams] = useSearchParams()
  
  const urlFilter = searchParams.get('filter') ?? ''

  const [filter, setFilter] = useState(urlFilter)

  const debouncedFilter = useDebounceValue(filter, 1000)

  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1

  const { data: tagsResponse, isLoading } = useQuery<TagResponse>({
    queryKey: ['get-tags', debouncedFilter, page],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3333/tags?_page=${page}&_per_page=10&title=${urlFilter}`)
      const data =  await response.json()
      console.log(data)
      return data
    },
    placeholderData: keepPreviousData
  })

  function handleFilter() {
    setSearchParams(params => {
      params.set('page', '1')
      params.set('filter', filter)

      return params
    })
  }

  if(isLoading){
    return null
  }

  return(
    <div className="py-10 space-y-8">
      <div>
        <Header/>
        <Tabs/>
      </div>

      <main className="max-w-6xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold"> Tags</h1>
          <button className="inline-flex items-center gap-1.5 text-xs bg-teal-300 text-teal-950 font-medium rounded-full px-2 py-1"> 
            <Plus className="size-3" />
            Create new
          </button>
        </div>

        <div className=" flex items-center justify-between">
          <div className="flex items-center">
            <Input variant='filter'>
              <Search className="size-3"/>
              <Control 
                placeholder="Search tags..." 
                onChange={e => setFilter(e.target.value)}
                value = {filter}
              />
            </Input>

            <Button onClick={handleFilter}>
              <Filter/>
              Filter
            </Button> 
          </div>

          <Button>
            <FileDown/>
            Export
          </Button>
        </div>

        <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Tag</TableHead>
                <TableHead>Amount of Videos</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {tagsResponse?.data.map((tag) => {
                return(
                  <TableRow key={tag.id}>
                    <TableCell></TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{tag.title}</span>
                        <span className="text-xs text-zinc-300">{tag.id}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-300">
                      {tag["Amount of videos"]} video(s)
                    </TableCell>
                    <TableCell>
                      <Button size="icon">
                        <MoreHorizontal className="size-4"/>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          
          {tagsResponse && <Pagination pages={tagsResponse.pages} items={tagsResponse.items} page={page}/>}
          {/* <Pagination /> */}
      </main>

    </div>
  )
}

export default App