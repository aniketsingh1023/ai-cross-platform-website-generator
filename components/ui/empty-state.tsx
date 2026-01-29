import React from 'react'
import Image from 'next/image'
interface  Props {
    title : string , 
    description : string , 
    imageSrc ?: string , 

}

const EmptyState = ({title , description , imageSrc}:Props) => {
 return (
    <div className='flex flex-col items-centre justify-centre py-16'>
       <Image src={imageSrc!} alt={title} className='w-48 h-48 mb-4' height={90} width={90}/>
       <h2 className='text-4xl font-semibold text-grey-500'>
        {title}
       </h2>
       <p className='text-grey-400'>
        {description}
       </p>
    </div>
 )
}


export default EmptyState