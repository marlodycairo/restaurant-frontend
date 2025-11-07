import { useEffect, useState } from 'react';
import type { Product } from '../interfaces/product.interface';
import { getProducts } from '../fetch.data';


export const ProductsList = () => {
  const [products, setProducts] = useState<Product[]>([]);


  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadData();
  }, []);
  

  return (
    <div className='container py-4'>
      <div className="row row-cols-1 row-cols-md-3 g-4">
        {products.map((p) => (
          <div key={p.id} className="col">
            <div style={{ border: '2px solid #7be63eff'}} className="card text-center h-100">
              <img style={{ width:"100%"}} src={p.imagePath} className="card-img-top" alt={p.productName} />
              <div className="card-body">
                <h5 className="card-title">{p.productName}</h5>
                <p className="card-text">Unit Price: <span className='badge text-bg-info' >{p.unitPrice}</span></p>
                <button>Add</button>
              </div>
            </div>
          </div>
        ))}
        </div>


    </div>
  )
}
