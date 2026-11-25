import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/formatPrice.js';
import { imageUrl } from '../api/client.js';
export default function ProductCard({ product }) {
  return <article>
    <Link className="product-art" to={`/product/${product._id}`} aria-label={`View ${product.name}`}><img className="product-image" src={imageUrl(product.image)} alt={product.name} loading="lazy" /></Link>
    <div className="product-info">
      {product.stock === 0 ? <div className="product-flag">Out of Stock</div> : product.isFeatured && <div className="product-flag">Featured</div>}
      <h3><Link to={`/product/${product._id}`}>{product.name}</Link></h3>
      <div className="product-category">{product.category}</div>
      <p className="product-price">{formatPrice(product.price)}</p>
    </div>
  </article>;
}
